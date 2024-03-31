#include "control.h"
#include "OneWire.h"
#include "DallasTemperature.h"
#include "Wire.h"
#include "BH1750.h"
#include "SPI.h"
#include "DHT.h"

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

Limit tempLimit(30, 22);
Limit lightLimit(800, 400);
Limit soilLimit(70, 10);

Device device(false, false, false);
MotorStateEnum motor_state = MotorStateEnum::NONE;

Sensor sensor;
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
bool run_mode = false;

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature temperature_sensor(&oneWire);
BH1750 lightMeter(0x23);

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
    float value = lightMeter.readLightLevel();
    return value < 0 ? 0 : value;
}

float getTemperatureValue()
{
    float value = temperature_sensor.getTempCByIndex(0);
    return value < 0 ? 0 : value;
}

Control::Control()
{
}

void Control::initDisplay()
{
    display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
    display.clearDisplay();
    display.setTextSize(1.8);
    display.setTextColor(WHITE);
    display.setCursor(0, 30);
    display.println("-- E-SMART IOT --");
    display.display();
}

void Control::initialize()
{
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

    digitalWrite(PIN_TURN_LEFT, LOW);
    digitalWrite(PIN_TURN_RIGHT, LOW);
    delay(2000);
}

unsigned long prevMs = 0;
void Control::run()
{
    if (motor_state != MotorStateEnum::NONE)
    {
        int limitLeft = digitalRead(PIN_LIMIT_LEFT);
        int limitRight = digitalRead(PIN_LIMIT_RIGHT);
        if ((limitLeft == LOW && motor_state == MotorStateEnum::LEFT) || (limitRight == LOW && motor_state == MotorStateEnum::RIGHT))
        {
            digitalWrite(PIN_TURN_LEFT, LOW);
            digitalWrite(PIN_TURN_RIGHT, LOW);
            digitalWrite(PIN_EN_MOTOR, LOW);
            motor_state = MotorStateEnum::NONE;
        }
    }

    if (!run_mode)
        return;
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
}

void Control::getCurrentSensorValue()
{
    sensor.light = getLightValue();
    sensor.soil = getSoilValue();
    sensor.temperature = getTemperatureValue();
    sensor.rain = getRainValue();
}

// direct = 0 LEFT, direct =  1 RIGHT
void Control::motorControl(int speed, int direct)
{
    motor_state = direct == RIGHT_DIRECT ? MotorStateEnum::RIGHT : MotorStateEnum::LEFT;
    int limitLeft = digitalRead(PIN_LIMIT_LEFT);
    int limitRight = digitalRead(PIN_LIMIT_RIGHT);
    speed = (speed, MIN_SPEED, MAX_SPEED);
    analogWrite(PIN_EN_MOTOR, speed);
    if ((direct == LEFT_DIRECT && limitLeft == LOW) || (direct == RIGHT_DIRECT && limitRight == LOW))
    {
        digitalWrite(PIN_TURN_LEFT, LOW);
        digitalWrite(PIN_TURN_RIGHT, LOW);
        digitalWrite(PIN_EN_MOTOR, LOW);
        return;
    }
    digitalWrite(PIN_EN_MOTOR, HIGH);
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
