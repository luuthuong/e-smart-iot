#include "Arduino.h";
#include "db.h";

#ifndef control_h
#define control_h
class Control
{
private:
    Database db;
    void connectFirebase();
    void initPid();
    void initDisplay();
    void autoMode();
    void motorControl(int speed, int direct);
    void syncSensorLog();
    void syncDeviceLog();

public:
    void setup();
    void run();
    void syncDb();
    void initStream();
    bool canExecute();
    static void pidTask(void* parameters);
    static void displayTask(void* parameters); 
};
#endif