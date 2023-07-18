#include "control.h"
#include "OneWire.h"
#include "DallasTemperature.h"
#include "Wire.h"
#include "BH1750.h"
#include "SPI.h"
#include "Adafruit_GFX.h"
#include "Adafruit_SSD1306.h"
#include "DHT.h"
#include "PID_v1.h"
#include "ArduinoJson.h"
#include "util.h"
#include "limit.h"

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

#define MAX_SPEED 255
#define MIN_SPEED 0
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

#define LEFT_DIRECT 0
#define RIGHT_DIRECT 1

const String LIGHT = "light";
const String TEMP = "temp";
const String SOIL = "soil";

const String HIGH_LIMIT = "high";
const String LOW_LIMIT = "low";

const String LAMP = "lamp";
const String MOTOR = "motor";
const String PUMP = "pump";

Limit tempLimit(30, 22);
Limit lightLimit(800, 400);
Limit soilLimit(70, 10);

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
BH1750 lightMeter(0x23);
bool mode = false;

double setPoint, pidInput, pidOutput;
double consKp = 36, consKi = 0.07, consKd = 2.7;
int setpointTemp;
PID pid(&pidInput, &pidOutput, &setPoint, consKp, consKi, consKd, DIRECT);

const String parentPath = "/settings";
const String childPath[3] = {"/limits", "/manualController", "/mode"};

bool getRainValue()
{
    return digitalRead(PIN_RAIN) == LOW;
}

int getSoilValue()
{
    int value = analogRead(PIN_SOIL);
    return (100 - map((value), 0, 4095, 0, 100));
}

float getLightValue()
{
    return lightMeter.readLightLevel();
}

float getTemperatureValue()
{
    return sensors.getTempCByIndex(0);
}

void updateLimitChange(Limit *limit, String path, String value, String valueType, String displayName)
{
    if (valueType == "json")
    {
        StaticJsonDocument<100> jsondoc;
        DeserializationError error = deserializeJson(jsondoc, value);
        if (error)
        {
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

void updateRootLimit(String path, String value)
{
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, value.c_str());
    if (error)
    {
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

void limitChangeHandler(String path, String value, String valueType)
{
    if (path.equals(childPath[0]))
    {
        updateRootLimit(path, value);
        return;
    }
    path.remove(0, childPath[0].length() + 1);
    String subPath = path.substring(0, path.indexOf('/'));
    path.remove(0, subPath.length() + 1);

    if (subPath.equals(LIGHT))
        updateLimitChange(&lightLimit, path, value, valueType, "LIGHT");

    if (subPath.equals(SOIL))
        updateLimitChange(&soilLimit, path, value, valueType, "SOIL");

    if (subPath.equals(TEMP))
        updateLimitChange(&tempLimit, path, value, valueType, "TEMPERATURE");
}

void mannualControlChangeHandler(String path, String value)
{
    path.remove(0, childPath[1].length() + 1);
    bool active = String(value) == "true";
    if (path.equals(LAMP))
        digitalWrite(PIN_LAMP, active);
    if (path.equals(MOTOR))
        digitalWrite(PIN_EN_MOTOR, active);
    if (path.equals(PUMP))
        digitalWrite(PIN_PUMP, active);
}

void modeChangeHandler(String path, String value)
{
    mode = String(value) == "true";
    Serial.printf("Mode: %s\n", value);
}

void pathChangeHandler(String path, String value, String valueType)
{
    for (size_t i = 0; i < childPath->length(); i++)
    {
        switch (i)
        {
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

void streamCallback(MultiPathStream stream)
{
    size_t childLenght = sizeof(childPath) / sizeof(childPath[0]);
    for (size_t i = 0; i < childLenght; i++)
    {
        if (stream.get(childPath[i]))
            pathChangeHandler(stream.dataPath.c_str(), stream.value.c_str(), stream.type.c_str());
    }
}

void streamTimeoutCallback(bool timeout)
{
    if (timeout)
        Serial.println("stream timed out, resuming...\n");
}

void Control::initDisplay()
{
}

void Control::setup()
{
    this->connectFirebase();
    this->initPinMode();
}

void Control::initPinMode()
{
}
void Control::connectFirebase()
{
    this->db.connectFirebase();
    this->db.beginMultiPathStream(parentPath);
    Firebase.RTDB.setMultiPathStreamCallback(&this->db.stream, streamCallback, streamTimeoutCallback);
}

void Control::run()
{
    this->syncDb();
    this->autoMode();
    this->mannualMode();
    if (!this->db.stream.httpConnected())
        Serial.println("Server was disconnected!");
}

void Control::syncSensorLog()
{
    String currentDate = Util::getCurrentDate();
    String currentTime = Util::getCurrentTime();
    String documentPath = "History-Sensor/";
    FirebaseJson content;
    content.set("fields/light/integerValue", 20);
    content.set("fields/rain/integerValue", 20);
    content.set("fields/soil/integerValue", 20);
    content.set("fields/temperature/integerValue", 20);
    this->db.commitDocument(documentPath, content);
}

void Control::syncDeviceLog()
{
    String currentDate = Util::getCurrentDate();
    String currentTime = Util::getCurrentTime();
    String documentPath = "History-Device/";
    FirebaseJson content;
    content.set("fields/pump/booleanValue", true);
    content.set("fields/light/booleanValue", true);
    content.set("fields/motor/booleanValue", true);
    content.set("fields/fan/booleanValue", true);
    this->db.commitDocument(documentPath, content);
}

void Control::syncDb()
{
    this->syncDeviceLog();
    this->syncSensorLog();
}

void Control::mannualMode()
{
}
// direct = 0 LEFT, direct =  1 RIGHT
void Control::motorControl(int speed, int direct)
{
    int limitLeft = digitalRead(PIN_LIMIT_LEFT);
    int limitRight = digitalRead(PIN_LIMIT_RIGHT);
    speed = (speed, MIN_SPEED, MAX_SPEED);
    analogWrite(PIN_EN_MOTOR, speed);
    if ((direct == LEFT_DIRECT && limitLeft == LOW) || limitRight == LOW)
    {
        digitalWrite(PIN_TURN_LEFT, LOW);
        digitalWrite(PIN_TURN_RIGHT, LOW);
    }
    switch (direct)
    {
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

void Control::autoMode()
{
    this->db.json.iteratorBegin();

    this->db.json.iteratorEnd();
}

void Control::initPid()
{
    setPoint = map(setpointTemp, 0, 100, 0, 4095);
    pid.SetMode(1);
}

bool Control::canExecute()
{
    return this->db.canExecute();
}
