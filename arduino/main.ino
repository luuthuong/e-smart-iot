#include "Arduino.h"
#include "db.h"
#include "util.h"

#define DEFAULT_BAUD 9600

void setup() {
  Serial.begin(DEFAULT_BAUD);
  Util::connectWifi();
  Util::beginTimeClient();
}

void loop() {
  String currentTime = Util::getCurrentTime();
  Serial.println(currentTime);
  delay(1000);
}
