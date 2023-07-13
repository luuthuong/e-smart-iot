#include "Arduino.h";
#include "db.h";

#ifndef control_h
#define control_h
class Control
{
private:
    Database db;
    OneWire oneWire(ONE_WIRE_BUS);
    DallasTemperature sensors(&oneWire);
    Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
    BH1750 lightMeter(0x23);
    bool statePump, stateMotor, stateLamp, mode, stateFan;
    double setPoint, pidInput, pidOutput;
    double consKp = 36, consKi = 0.07, consKd = 2.7;
    int setpointTemp;
    PID pid(&pidInput, &pidOutput, &setPoint, consKp, consKi, consKd, DIRECT);

    void connectFirebase();
    void initPinMode();
    void initPid();
    void initDisplay();
    void autoMode();
    void mannualMode();
    void syncDb();

public:
    void setup();
    void run();
    void initStream();
    bool canExecute();
};
#endif