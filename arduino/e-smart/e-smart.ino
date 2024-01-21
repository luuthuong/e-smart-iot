#include "OneWire.h"
#include "DallasTemperature.h"
#include "Wire.h"
#include "BH1750.h"
#include "SPI.h"
#include "Adafruit_GFX.h"
#include "Adafruit_SSD1306.h"
#include "DHT.h"
#include "ArduinoJson.h"
#include "limit.h"
#include "device.h"
#include "sensor.h"
#include "db.h"

#define FIREBASEJSON_USE_PSRAM

#define DEFAULT_BAUD 115200
#define INTERVAL_SYNCDB 60000;

#pragma region Pin definition

#define ONE_WIRE_BUS 16
#define PIN_SOIL 39
#define PIN_RAIN 14
#define PIN_PUMP 12
#define PIN_FAN 1

#define PIN_EN_MOTOR 15
#define PIN_TURN_RIGHT 26
#define PIN_TURN_LEFT 25

#define PIN_LIMIT_LEFT 0
#define PIN_LIMIT_RIGHT 2

#define PIN_LAMP 13
#define PIN_HEAT_LAMP 

#define MAX_SPEED 255
#define MIN_SPEED 0
#define DEFAULT_SPEED 75
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

#define LEFT_DIRECT 0
#define RIGHT_DIRECT 1
#pragma endregion

#pragma region constants
const String LIGHT = "light";
const String TEMP = "temp";
const String SOIL = "soil";

const String HIGH_LIMIT = "high";
const String LOW_LIMIT = "low";

const String LAMP = "lamp";
const String MOTOR = "motor";
const String PUMP = "pump";

const String parentPath = "/settings";
const String childPath[3] = { "/limits", "/manualController", "/mode" };
#pragma endregion


Limit tempLimit(30, 22);
Limit lightLimit(800, 400);
Limit soilLimit(70, 10);

Device device(false, false, false);
MotorStateEnum motor_state = MotorStateEnum::NONE;

Sensor sensor;

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature temperature_sensor(&oneWire);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
BH1750 lightMeter(0x23);

bool ignore_display = false;
bool mode = false;
unsigned long prevMillis = 0;

#pragma region stream subcribe handler

void updateLimitChange(Limit* limit, String path, String value, String valueType, String displayName) {
	if (valueType == "json") {
		StaticJsonDocument<100> jsondoc;
		DeserializationError error = deserializeJson(jsondoc, value);
		if (error) {
			Serial.println("deserialize json failed!");
			Serial.println(error.f_str());
			return;
		}
		limit->high = jsondoc[HIGH_LIMIT].as<float>();
		limit->low = jsondoc[LOW_LIMIT].as<float>();
	}

	if (path.equals(HIGH_LIMIT) && valueType == "int")
		limit->high = value.toFloat();

	if (path.equals(LOW_LIMIT) && valueType == "int")
		limit->low = value.toFloat();

	Serial.printf("--------%s--------\n", displayName.c_str());
	Serial.printf("HIGH: %f\nLOW: %f\n", limit->high, limit->low);
	Serial.println("---------------------");
}

void updateRootLimit(String path, String value) {
	StaticJsonDocument<200> doc;
	DeserializationError error = deserializeJson(doc, value.c_str());
	if (error) {
		Serial.println("Deserialize json failed!");
		Serial.println(error.f_str());
		return;
	}

	lightLimit.high = doc[LIGHT][HIGH_LIMIT].as<float>();
	lightLimit.low = doc[LIGHT][LOW_LIMIT].as<float>();

	soilLimit.high = doc[SOIL][HIGH_LIMIT].as<float>();
	soilLimit.low = doc[SOIL][LOW_LIMIT].as<float>();

	tempLimit.high = doc[TEMP][HIGH_LIMIT].as<float>();
	tempLimit.low = doc[TEMP][LOW_LIMIT].as<float>();

	Serial.println("--------LIMIT SETTING--------");
	Serial.printf("LIGHT - HIGH: %f\tLOW: %f\n", lightLimit.high, lightLimit.low);
	Serial.printf("SOIL -  HIGH: %f\tLOW: %f\n", soilLimit.high, soilLimit.low);
	Serial.printf("TEMPERATURE - HIGH: %f\tLOW: %f\n", tempLimit.high, tempLimit.low);
	Serial.println("----------------------------");
}

void limitChangeHandler(String path, String value, String valueType) {
	if (path.equals(childPath[0])) {
		updateRootLimit(path, value);
		return;
	}
	path.remove(0, childPath[0].length() + 1);
	String subPath = path.substring(0, path.indexOf('/'));
	path.remove(0, subPath.length() + 1);

	if (subPath.equals(LIGHT)) {
		updateLimitChange(&lightLimit, path, value, valueType, "LIGHT");
		return;
	}

	if (subPath.equals(SOIL)) {
		updateLimitChange(&soilLimit, path, value, valueType, "SOIL");
		return;
	}

	if (subPath.equals(TEMP)) {
		updateLimitChange(&tempLimit, path, value, valueType, "TEMPERATURE");
		return;
	}
}

void mannualModeWrite(String name, int pin, bool state) {
	Serial.printf("--------MANNUAL TRIGGER--------\n");
	Serial.printf("STATE %s: %d \n", name, state);
	digitalWrite(pin, state);
	Serial.println("----------------------------");
}

void mannualControlChangeHandler(String path, String value) {
	if (mode)
		return;

	path.remove(0, childPath[1].length() + 1);
	bool active = String(value) == "true";
	if (path.equals(LAMP)) {
		mannualModeWrite("LAMP", PIN_LAMP, active);
		return;
	}

	if (path.equals(MOTOR)) {
		int direct = active ? RIGHT_DIRECT : LEFT_DIRECT;
		motorControl(DEFAULT_SPEED, direct);
		return;
	}

	if (path.equals(PUMP))
		mannualModeWrite("PUMP", PIN_PUMP, active);
}

void modeChangeHandler(String path, String value) {
	mode = String(value) == "true";
	digitalWrite(PIN_LAMP, LOW);
	digitalWrite(PIN_PUMP, LOW);
	Serial.printf("Mode: %s\n", value);
}

void pathChangeHandler(String path, String value, String valueType) {
	for (size_t i = 0; i < childPath->length(); i++) {
		switch (i) {
		case 0:
			if (path.indexOf(childPath[i]) >= 0)
				limitChangeHandler(path, value, valueType);
			break;
		case 1:
			if (path.indexOf(childPath[i]) >= 0)
				mannualControlChangeHandler(path, value);
			break;
		case 2:
			if (path.indexOf(childPath[i]) >= 0)
				modeChangeHandler(path, value);
			break;
		default:
			break;
		}
	}
}

void streamCallback(MultiPathStream stream) {
	size_t childLenght = sizeof(childPath) / sizeof(childPath[0]);
	for (size_t i = 0; i < childLenght; i++) {
		if (stream.get(childPath[i]))
			pathChangeHandler(stream.dataPath.c_str(), stream.value.c_str(), stream.type.c_str());
	}
}

void streamTimeoutCallback(bool timeout) {
	if (timeout)
		Serial.println("stream timed out, resuming...\n");
}
#pragma endregion

#pragma region get sensor'value functions

bool getRainValue() {
	return digitalRead(PIN_RAIN) == LOW;
}

int getSoilValue() {
	int value = analogRead(PIN_SOIL);
	return (100 - map((value), 0, 4095, 0, 100));
}

float getLightValue() {
	float value = lightMeter.readLightLevel();
	float result = value < 0 ? 0 : value;
	return (100 - map((result), 0, 1050, 0, 100));
}

float getTemperatureValue() {
	temperature_sensor.requestTemperatures();
	float value = temperature_sensor.getTempCByIndex(0);
	return value < 0 ? 0 : value;
}
#pragma endregion

#pragma region database config
Database db;
FirebaseJson json;
void connectFirebase() {
	if (ignore_display) {
		db.connectFirebase();
		db.beginMultiPathStream(parentPath);
		Firebase.RTDB.setMultiPathStreamCallback(&db.stream, streamCallback, streamTimeoutCallback);
		Serial.println("Firebase connected");
		return;
	}
	display.clearDisplay();
	display.println("Connecting to Firebase...");
	display.display();
	db.connectFirebase();
	db.beginMultiPathStream(parentPath);
	Firebase.RTDB.setMultiPathStreamCallback(&db.stream, streamCallback, streamTimeoutCallback);
	display.clearDisplay();
	display.println("Firebase connected !");
	display.display();
}
#pragma endregion

#pragma region display
void initDisplay() {
	if (ignore_display)
		return;
	display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
	display.clearDisplay();
	display.setTextSize(1.8);
	display.setTextColor(WHITE);
	display.setCursor(0, 30);
	display.println("-- E-SMART IOT --");
	display.display();
	delay(2000);
}
#pragma endregion

#pragma region task_handle_t
TaskHandle_t getCurrentValuesTaskHandle;
TaskHandle_t autoModeTaskHandle;
#pragma endregion


void setup() {
	Serial.begin(DEFAULT_BAUD);
	Util::connectWifi();
	Util::beginTimeClient();
	Wire.begin(5, 4);
	lightMeter.begin();
	temperature_sensor.begin();

	pinMode(PIN_LIMIT_RIGHT, INPUT);
	pinMode(PIN_LIMIT_LEFT, INPUT);
	pinMode(PIN_PUMP, OUTPUT);
	pinMode(PIN_TURN_LEFT, OUTPUT);
	pinMode(PIN_TURN_RIGHT, OUTPUT);
	pinMode(PIN_EN_MOTOR, OUTPUT);
	pinMode(PIN_FAN, OUTPUT);
	pinMode(PIN_LAMP, OUTPUT);

	initDisplay();
	connectFirebase();
	RTOS_task_setup();
}

void loop() {
	 sendToRealTimeDb();
	 bool isReady = ((millis() - prevMillis > 60000 * 20) || prevMillis == 0);
	 if (isReady) {
		syncDeviceLog();
		syncSensorLog();
		prevMillis = millis();
	 }
}

void RTOS_task_setup() {
	xTaskCreatePinnedToCore(
		getCurrentValuesTask,
		"get-current-values-task",
		2000,
		NULL,
		1,
		&getCurrentValuesTaskHandle,
		0
	);

	xTaskCreatePinnedToCore(
		autoModeTask,
		"auto-mode-task",
		2000,
		NULL,
		1,
		&autoModeTaskHandle,
		1
	);
}

#pragma region get current values task
void getCurrentValuesTask(void* parameter) {
	for (;;) {
		getSensorValues();
		getDeviceValues();
		displaySensorValues();
		vTaskDelay(1000 / portTICK_PERIOD_MS);
	}
} 

void getSensorValues() {
	sensor.light = getLightValue();
	sensor.soil = getSoilValue();
	sensor.temperature = getTemperatureValue();
	sensor.rain = getRainValue();
}

void getDeviceValues() {
	device.lamp = digitalRead(PIN_LAMP);
	device.motor = digitalRead(PIN_TURN_RIGHT);
	device.pump = digitalRead(PIN_PUMP);
}

void displaySensorValues() {
	if (ignore_display)
		return;
	display.clearDisplay();
	display.setCursor(0, 0);
	display.print("Time: ");
	display.print(Util::getCurrentTime());

	display.setCursor(90, 0);
	display.print("Rain:");
	display.print(sensor.rain ? 1 : 0);

	display.setCursor(0, 15);
	display.print("S:");
	display.print((int)sensor.soil);
	display.print("%");

	display.setCursor(53, 15);
	display.print("H/L: ");
	display.print((int)soilLimit.high);
	display.print("/");
	display.print((int)soilLimit.low);

	display.setCursor(0, 30);
	display.print("T:");
	display.print((int)sensor.temperature);
	display.print("C");

	display.setCursor(53, 30);
	display.print("H/L: ");
	display.print((int)tempLimit.high);
	display.print("/");
	display.print((int)tempLimit.low);

	display.setCursor(0, 45);
	display.print("L:");
	display.print((int)sensor.light);
	display.print("%");

	display.setCursor(53, 45);
	display.print("H/L: ");
	display.print((int)lightLimit.high);
	display.print("/");
	display.print((int)lightLimit.low);
	display.display();
}
#pragma endregion


void autoModeTask(void* parameter) {
	for (;;) {
		if (motor_state != MotorStateEnum::NONE) {
			int limitLeft = digitalRead(PIN_LIMIT_LEFT);
			int limitRight = digitalRead(PIN_LIMIT_RIGHT);
			if ((limitLeft == LOW && motor_state == MotorStateEnum::LEFT) || (limitRight == LOW && motor_state == MotorStateEnum::RIGHT)) {
				digitalWrite(PIN_TURN_LEFT, LOW);
				digitalWrite(PIN_TURN_RIGHT, LOW);
				digitalWrite(PIN_EN_MOTOR, LOW);
				motor_state = MotorStateEnum::NONE;
			}
		}

		if (!mode)
			continue;
		if (sensor.rain)
			motorControl(DEFAULT_SPEED, RIGHT_DIRECT);
		else
			motorControl(DEFAULT_SPEED, LEFT_DIRECT);

		if (sensor.light < lightLimit.low)
			digitalWrite(PIN_LAMP, HIGH);
		else
			digitalWrite(PIN_LAMP, LOW);

		if (sensor.soil < soilLimit.low)
			digitalWrite(PIN_PUMP, HIGH);
		else
			digitalWrite(PIN_PUMP, LOW);

		vTaskDelay(100 / portTICK_PERIOD_MS);
	}
}

#pragma region sync db
void syncDeviceLog() {
  String currentDate = Util::getCurrentDate();
  String currentTime = Util::getCurrentTime();
  String documentPath = "History-Device/";
  FirebaseJson content;
  content.set("fields/pump/booleanValue", device.pump);
  content.set("fields/light/booleanValue", device.lamp);
  content.set("fields/motor/booleanValue", device.motor);
  content.set("fields/fan/booleanValue", 1);
  db.commitDocument(documentPath, content);
}

void syncSensorLog() {
  String currentDate = Util::getCurrentDate();
  String currentTime = Util::getCurrentTime();
  String documentPath = "History-Sensor/";
  FirebaseJson content;
  content.set("fields/light/integerValue", sensor.light);
  content.set("fields/rain/booleanValue", sensor.rain);
  content.set("fields/soil/integerValue", sensor.soil);
  content.set("fields/temperature/integerValue", sensor.temperature);
  db.commitDocument(documentPath, content);
}
#pragma endregion

#pragma region motor control
// direct = 0 LEFT, direct =  1 RIGHT
void motorControl(int speed, int direct) {
  motor_state = direct == RIGHT_DIRECT ? MotorStateEnum::RIGHT : MotorStateEnum::LEFT;
  int limitLeft = digitalRead(PIN_LIMIT_LEFT);
  int limitRight = digitalRead(PIN_LIMIT_RIGHT);
  speed = (speed, MIN_SPEED, MAX_SPEED);
  analogWrite(PIN_EN_MOTOR, speed);
  if ((direct == LEFT_DIRECT && limitLeft == LOW) || (direct == RIGHT_DIRECT && limitRight == LOW)) {
    digitalWrite(PIN_TURN_LEFT, LOW);
    digitalWrite(PIN_TURN_RIGHT, LOW);
	digitalWrite(PIN_EN_MOTOR, LOW);
	return;
  }
  digitalWrite(PIN_EN_MOTOR, HIGH);
  switch (direct) {
    case LEFT_DIRECT:
      digitalWrite(PIN_TURN_RIGHT, LOW);
      digitalWrite(PIN_TURN_LEFT, HIGH);
      break;
    case RIGHT_DIRECT:
      digitalWrite(PIN_TURN_RIGHT, HIGH);
      digitalWrite(PIN_TURN_LEFT, LOW);
      break;
    default:
      return;
  }
}
#pragma endregion

#pragma region send to realtime db
void sendToRealTimeDb() {
	FirebaseJson jSensor;
	jSensor.add("light", sensor.light);
	jSensor.add("temperature", sensor.temperature);
	jSensor.add("soil", sensor.soil);
	jSensor.add("rain", sensor.rain);
	json.add("sensors", jSensor);

	json.add("mode", mode);

	FirebaseJson jDevice;
	jDevice.set("lamp", device.lamp);
	jDevice.set("motor", !(bool)digitalRead(PIN_LIMIT_RIGHT));
	jDevice.set("pump", (bool)digitalRead(PIN_PUMP));

	json.add("devices", jDevice);
	db.setJson("/actValues", json);
	json.clear();
}
#pragma endregion