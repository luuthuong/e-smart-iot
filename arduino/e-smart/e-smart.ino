#include "Arduino.h"
#include "util.h"
#include "control.h";

#define DEFAULT_BAUD 9600
#define INTERVAL 500
Control ctrl;
unsigned long prevMillis = 0;

void setup() {
  Serial.begin(DEFAULT_BAUD);
  Util::connectWifi();
  Util::beginTimeClient();
  ctrl.connectFirebase();
}

void loop() {
  bool isReady = ctrl.canExecute() && (millis() - prevMillis > INTERVAL || prevMillis == 0);
  if(!isReady)
    return;
  prevMillis = millis();
  ctrl.run();
}