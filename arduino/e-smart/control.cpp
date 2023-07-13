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
#include "util.h"

#define ONE_WIRE_BUS 16
#define PIN_SOIL 39
#define PIN_RAIN 14
#define PIN_PUMP 12
#define PIN_FAN 1

#define PIN_EN_MOTOR 15
#define PIN_LIMIT_LEFT 0
#define PIN_LIMIT_RIGHT 2
#define PIN_LAMP 13

#define MAX_SPEED 255
#define MIN_SPEED 0
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

const String parentPath = "/test";
const String childPath[2] = {"/node1", "/node2"};
void streamCallback(MultiPathStreamData stream)
{
    size_t numChild = sizeof(childPath) / sizeof(childPath[0]);

    for (size_t i = 0; i < numChild; i++)
    {
        if (stream.get(childPath[i]))
        {
            Serial.printf("path: %s, event: %s, type: %s, value: %s%s", stream.dataPath.c_str(), stream.eventType.c_str(), stream.type.c_str(), stream.value.c_str(), i < numChild - 1 ? "\n" : "");
        }
    }
    Serial.printf("Received stream payload size: %d (Max. %d)\n\n", stream.payloadLength(), stream.maxPayloadLength());
}

void streamTimeoutCallback(bool timeout)
{
    if (timeout)
        Serial.println("stream timed out, resuming...\n");
}

void Control::initDisplay()
{
}

void Control::autoMode()
{
    this->db.json.iteratorBegin();

    this->db.json.iteratorEnd();
}

void Control::syncDb()
{
}

void Control::mannualMode()
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
    Firebase.setMultiPathStreamCallback(this->db.stream, streamCallback, streamTimeoutCallback);
}

void Control::run()
{
    this->syncDb();
    this->autoMode();
    this->mannualMode();
    if (!this->db.stream.httpConnected())
        Serial.println("Server was disconnected!");
}

void Control::initPid()
{
    this->setPoint = map(this->setpointTemp, 0, 100, 0 4095);
    this->pid.SetMode(1);
}

bool Control::canExecute()
{
    return this->db.canExecute();
}