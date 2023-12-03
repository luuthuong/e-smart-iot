#include "Arduino.h"
#include "util.h"
#include "control.h"

#define DEFAULT_BAUD 115200
#define INTERVAL 60000
Control ctrl;
unsigned long prevMillis = 0;


void setup() {
  Serial.begin(DEFAULT_BAUD);
  Util::connectWifi();
  Util::beginTimeClient();
  ctrl.setup();
  
  xTaskCreate(
    Control::pidTask,
    "Task",
    4000,
    NULL,
    1,
    NULL);

  xTaskCreate(
    Control::displayTask,
    "Task",
    2000,
    NULL,
    2,
    NULL);
}

void loop() {
  bool isReady = ctrl.canExecute() && (millis() - prevMillis > INTERVAL || prevMillis == 0);
  if (isReady) {
    ctrl.syncDb();
    prevMillis = millis();
  }
  ctrl.run();
}