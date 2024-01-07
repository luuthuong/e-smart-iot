//#include "control.h"
//#include "OneWire.h"
//#include "DallasTemperature.h"
//#include "Wire.h"
//#include "BH1750.h"
//#include "SPI.h"
//#include "Adafruit_GFX.h"
//#include "Adafruit_SSD1306.h"
//#include "DHT.h"
//#include "PID_v1.h"
//#include "ArduinoJson.h"
//#include "util.h"
//#include "limit.h"
//#include "device.h"
//#include "sensor.h"
//
//#define ONE_WIRE_BUS 16
//#define PIN_SOIL 39
//#define PIN_RAIN 14
//#define PIN_PUMP 12
//#define PIN_FAN 1
//
//#define PIN_EN_MOTOR 15
//#define PIN_TURN_RIGHT 26
//#define PIN_TURN_LEFT 25
//
//#define PIN_LIMIT_LEFT 0
//#define PIN_LIMIT_RIGHT 2
//
//#define PIN_LAMP 13
//
//#define MAX_SPEED 255
//#define MIN_SPEED 0
//#define SCREEN_WIDTH 128
//#define SCREEN_HEIGHT 64
//
//#define LEFT_DIRECT 0
//#define RIGHT_DIRECT 1
//
//const String LIGHT = "light";
//const String TEMP = "temp";
//const String SOIL = "soil";
//
//const String HIGH_LIMIT = "high";
//const String LOW_LIMIT = "low";
//
//const String LAMP = "lamp";
//const String MOTOR = "motor";
//const String PUMP = "pump";
//
//Limit tempLimit(30, 22);
//Limit lightLimit(800, 400);
//Limit soilLimit(70, 10);
//
//Device device(false, false, false);
//Sensor currentSensor;
//
//OneWire oneWire(ONE_WIRE_BUS);
//DallasTemperature sensors(&oneWire);
//Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
//BH1750 lightMeter(0x23);
//bool mode = false;
//
//const String parentPath = "/settings";
//const String childPath[3] = { "/limits", "/manualController", "/mode" };
//
//bool getRainValue() {
//  return digitalRead(PIN_RAIN) == LOW;
//}
//
//int getSoilValue() {
//  int value = analogRead(PIN_SOIL);
//  return (100 - map((value), 0, 4095, 0, 100));
//}
//
//float getLightValue() {
//  float value = lightMeter.readLightLevel();
//  return value < 0 ? 0 : value;
//}
//
//float getTemperatureValue() {
//  float value = sensors.getTempCByIndex(0);
//  return value < 0 ? 0 : value;
//}
//
//void updateLimitChange(Limit* limit, String path, String value, String valueType, String displayName) {
//  if (valueType == "json") {
//    StaticJsonDocument<100> jsondoc;
//    DeserializationError error = deserializeJson(jsondoc, value);
//    if (error) {
//      Serial.println("deserialize json failed!");
//      Serial.println(error.f_str());
//      return;
//    }
//    limit->high = jsondoc[HIGH_LIMIT].as<float>();
//    limit->low = jsondoc[LOW_LIMIT].as<float>();
//  }
//
//  if (path.equals(HIGH_LIMIT) && valueType == "int")
//    limit->high = value.toFloat();
//
//  if (path.equals(LOW_LIMIT) && valueType == "int")
//    limit->low = value.toFloat();
//
//  Serial.printf("--------%s--------\n", displayName.c_str());
//  Serial.printf("HIGH: %f\nLOW: %f\n", limit->high, limit->low);
//  Serial.println("---------------------");
//}
//
//void updateRootLimit(String path, String value) {
//  StaticJsonDocument<200> doc;
//  DeserializationError error = deserializeJson(doc, value.c_str());
//  if (error) {
//    Serial.println("Deserialize json failed!");
//    Serial.println(error.f_str());
//    return;
//  }
//
//  lightLimit.high = doc[LIGHT][HIGH_LIMIT].as<float>();
//  lightLimit.low = doc[LIGHT][LOW_LIMIT].as<float>();
//
//  soilLimit.high = doc[SOIL][HIGH_LIMIT].as<float>();
//  soilLimit.low = doc[SOIL][LOW_LIMIT].as<float>();
//
//  tempLimit.high = doc[TEMP][HIGH_LIMIT].as<float>();
//  tempLimit.low = doc[TEMP][LOW_LIMIT].as<float>();
//
//  Serial.println("--------LIMIT SETTING--------");
//  Serial.printf("LIGHT - HIGH: %f\tLOW: %f\n", lightLimit.high, lightLimit.low);
//  Serial.printf("SOIL -  HIGH: %f\tLOW: %f\n", soilLimit.high, soilLimit.low);
//  Serial.printf("TEMPERATURE - HIGH: %f\tLOW: %f\n", tempLimit.high, tempLimit.low);
//  Serial.println("----------------------------");
//}
//
//void limitChangeHandler(String path, String value, String valueType) {
//  if (path.equals(childPath[0])) {
//    updateRootLimit(path, value);
//    return;
//  }
//  path.remove(0, childPath[0].length() + 1);
//  String subPath = path.substring(0, path.indexOf('/'));
//  path.remove(0, subPath.length() + 1);
//
//  if (subPath.equals(LIGHT))
//    updateLimitChange(&lightLimit, path, value, valueType, "LIGHT");
//
//  if (subPath.equals(SOIL))
//    updateLimitChange(&soilLimit, path, value, valueType, "SOIL");
//
//  if (subPath.equals(TEMP))
//    updateLimitChange(&tempLimit, path, value, valueType, "TEMPERATURE");
//}
//
//void mannualModeWrite(String name, int pin, bool state) {
//	Serial.printf("--------MANNUAL TRIGGER--------\n");
//	Serial.printf("STATE %s: %d \n", name, state);
//	digitalWrite(pin, state);
//	Serial.println("----------------------------");
//}
//
//void mannualControlChangeHandler(String path, String value) {
//    if (mode)
//        return;
//
//  path.remove(0, childPath[1].length() + 1);
//  bool active = String(value) == "true";
//  if (path.equals(LAMP)){
//    device.lamp = active;
//  }
//
//  if (path.equals(MOTOR)){
//    device.motor = active;
//    mannualModeWrite("MOTOR", PIN_EN_MOTOR, active);
//  }
//
//  if (path.equals(PUMP)){
//    device.pump = active;
//    mannualModeWrite("PUMP", PIN_PUMP, active);
//  }
//}
//
//
//void modeChangeHandler(String path, String value) {
//  mode = String(value) == "true";
//  Serial.printf("Mode: %s\n", value);
//}
//
//void pathChangeHandler(String path, String value, String valueType) {
//  for (size_t i = 0; i < childPath->length(); i++) {
//    switch (i) {
//      case 0:
//        if (path.indexOf(childPath[i]) >= 0)
//          limitChangeHandler(path, value, valueType);
//        break;
//      case 1:
//        if (path.indexOf(childPath[i]) >= 0)
//          mannualControlChangeHandler(path, value);
//        break;
//      case 2:
//        if (path.indexOf(childPath[i]) >= 0)
//          modeChangeHandler(path, value);
//        break;
//      default:
//        break;
//    }
//  }
//}
//
//void streamCallback(MultiPathStream stream) {
//  size_t childLenght = sizeof(childPath) / sizeof(childPath[0]);
//  for (size_t i = 0; i < childLenght; i++) {
//    if (stream.get(childPath[i]))
//      pathChangeHandler(stream.dataPath.c_str(), stream.value.c_str(), stream.type.c_str());
//  }
//}
//
//void streamTimeoutCallback(bool timeout) {
//  if (timeout)
//    Serial.println("stream timed out, resuming...\n");
//}
//
//void Control::initDisplay() {
//  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
//  display.clearDisplay();
//  display.setTextSize(1.8);
//  display.setTextColor(WHITE);
//  display.setCursor(0, 30);
//  display.println("-- E-SMART IOT --");
//  display.display();
//}
//
//void Control::setup() {
//  Wire.begin(5, 4);
//  lightMeter.begin();
//  sensors.begin();
//
//  pinMode(PIN_LIMIT_RIGHT, INPUT);
//  pinMode(PIN_LIMIT_LEFT, INPUT);
//  pinMode(PIN_PUMP, OUTPUT);
//  pinMode(PIN_TURN_LEFT, OUTPUT);
//  pinMode(PIN_TURN_RIGHT, OUTPUT);
//  pinMode(PIN_EN_MOTOR, OUTPUT);
//  pinMode(PIN_FAN, OUTPUT);
//
//  digitalWrite(PIN_TURN_LEFT, LOW);
//  digitalWrite(PIN_TURN_RIGHT, LOW);
//
//  this->initDisplay();
//  delay(2000);
//  display.clearDisplay();
//  display.println("Connecting to Firebase...");
//  display.display();
//  this->connectFirebase();
//  display.clearDisplay();
//  display.println("Firebase connected !");
//  display.display();
//}
//
//
//void Control::connectFirebase() {
//  this->db.connectFirebase();
//  this->db.beginMultiPathStream(parentPath);
//  Firebase.RTDB.setMultiPathStreamCallback(&this->db.stream, streamCallback, streamTimeoutCallback);
//}
//
//unsigned long prevMs = 0;
//void Control::run() {
//  if (this->canExecute()) {
//    FirebaseJson jSensor;
//    jSensor.set("light", currentSensor.light);
//    jSensor.set("temperature", currentSensor.temperature);
//    jSensor.set("soil", currentSensor.soil);
//    this->db.setJson("/actValues/sensors", jSensor);
//
//    FirebaseJson jMode;
//    jMode.set("mode", mode);
//    this->db.setJson("/actValues", jMode);
//
//
//    FirebaseJson jDevice;
//    jDevice.set("lamp", device.lamp);
//    jDevice.set("motor", (bool)digitalRead(PIN_EN_MOTOR));
//    jDevice.set("pump", (bool)digitalRead(PIN_PUMP));
//    this->db.setJson("/actValues/devices", jDevice);
//    prevMs = millis();
//  }
//
//  digitalWrite(PIN_PUMP, device.pump);
//  this->motorControl(160, (int)device.motor);
//
//  // if (!this->db.stream.httpConnected()) {
//  //   display.println("Firebase disconnected!");
//  //   Serial.println("Server was disconnected!");
//  // }
//}
//
//void Control::getCurrentSensorValue(){
//  currentSensor.light = getLightValue();
//  currentSensor.soil = getSoilValue();
//  currentSensor.temperature = getTemperatureValue();
//  currentSensor.rain = getRainValue();
//}
//
//void Control::syncSensorLog() {
//  String currentDate = Util::getCurrentDate();
//  String currentTime = Util::getCurrentTime();
//  String documentPath = "History-Sensor/";
//  FirebaseJson content;
//  content.set("fields/light/integerValue", currentSensor.light);
//  content.set("fields/rain/booleanValue", currentSensor.rain);
//  content.set("fields/soil/integerValue", currentSensor.soil);
//  content.set("fields/temperature/integerValue", currentSensor.temperature);
//  this->db.commitDocument(documentPath, content);
//}
//
//void Control::syncDeviceLog() {
//  String currentDate = Util::getCurrentDate();
//  String currentTime = Util::getCurrentTime();
//  String documentPath = "History-Device/";
//  FirebaseJson content;
//  content.set("fields/pump/booleanValue", digitalRead(PIN_PUMP));
//  content.set("fields/light/booleanValue", device.lamp);
//  content.set("fields/motor/booleanValue", digitalRead(PIN_TURN_RIGHT));
//  content.set("fields/fan/booleanValue", digitalRead(PIN_FAN));
//  this->db.commitDocument(documentPath, content);
//}
//
//void Control::syncDb() {
//  this->syncDeviceLog();
//  this->syncSensorLog();
//}
//
//// direct = 0 LEFT, direct =  1 RIGHT
//void Control::motorControl(int speed, int direct) {
//  int limitLeft = digitalRead(PIN_LIMIT_LEFT);
//  int limitRight = digitalRead(PIN_LIMIT_RIGHT);
//  speed = (speed, MIN_SPEED, MAX_SPEED);
//  analogWrite(PIN_EN_MOTOR, speed);
//  if ((direct == LEFT_DIRECT && limitLeft == LOW) || (direct == RIGHT_DIRECT && limitRight == LOW)) {
//    digitalWrite(PIN_TURN_LEFT, LOW);
//    digitalWrite(PIN_TURN_RIGHT, LOW);
//  }
//  switch (direct) {
//    case LEFT_DIRECT:
//      digitalWrite(PIN_TURN_RIGHT, LOW);
//      digitalWrite(PIN_TURN_LEFT, HIGH);
//      break;
//    case RIGHT_DIRECT:
//      digitalWrite(PIN_TURN_RIGHT, HIGH);
//      digitalWrite(PIN_TURN_LEFT, LOW);
//      break;
//    default:
//      return;
//  }
//}
//
//void Control::displayTask(void* parameters) {
//  for (;;) {
//    display.clearDisplay();
//    display.setCursor(0, 0);
//    display.print("Time: ");
//    display.print(Util::getCurrentTime());
//
//    display.setCursor(90, 0);
//    display.print("Rain:");
//    display.print(currentSensor.rain ? 1 : 0);
//
//    display.setCursor(0, 15);
//    display.print("Soil:");
//    display.print((int)currentSensor.soil);
//    display.print("%");
//
//    display.setCursor(64, 15);
//    display.print("H/L: ");
//    display.print((int)soilLimit.high);
//    display.print("/");
//    display.print((int)soilLimit.low);
//
//    display.setCursor(0, 30);
//    display.print("Temp:");
//    display.print((int)currentSensor.temperature);
//    display.print("C");
//
//    display.setCursor(64, 30);
//    display.print("H/L: ");
//    display.print((int)tempLimit.high);
//    display.print("/");
//    display.print((int)tempLimit.low);
//
//    display.setCursor(0, 45);
//    display.print("Light:");
//    display.print((int)currentSensor.light);
//    display.print("%");
//
//    display.setCursor(64, 45);
//    display.print("H/L: ");
//    display.print((int)lightLimit.high);
//    display.print("/");
//    display.print((int)lightLimit.low);
//
//    display.display();
//    vTaskDelay(1000 / portTICK_PERIOD_MS);  // delay 10ms
//  }
//}
//
//bool Control::canExecute() {
//  return this->db.canExecute();
//}
