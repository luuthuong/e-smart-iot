#include "Arduino.h";
#include "db.h";

#ifndef control_h
#define control_h
class Control
{
private:
    Database db;
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