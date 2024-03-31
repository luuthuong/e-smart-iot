#include "Models/device.h"
#include "Utils/util.h"
#include "Models/limit.h"
#include "Models/sensor.h"
#include "Adafruit_GFX.h"
#include "Adafruit_SSD1306.h"

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

#define MAX_SPEED 150
#define MIN_SPEED 0
#define DEFAULT_SPEED 75

#define LEFT_DIRECT 0
#define RIGHT_DIRECT 1

#ifndef control_h
#define control_h

extern Limit tempLimit;
extern Limit lightLimit;
extern Limit soilLimit;
extern Device device;
extern Sensor sensor;
extern MotorStateEnum motor_state;
extern Adafruit_SSD1306 display;
extern bool run_mode;

float getTemperatureValue();
float getLightValue();
int getSoilValue();
bool getRainValue();

class Control
{
private:
public:
    Control();
    void initDisplay();
    void initialize();
    void motorControl(int speed, int direct);
    void getCurrentSensorValue();
    void run();
};
#endif