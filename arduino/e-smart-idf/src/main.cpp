#include <Arduino.h>
#include <ESP32Web.h>
#include "Services/stream-service.h"
#include "Services/rtos-tasks.h"

Database db;
void connectFirebase();
void rtosTaskSetup();
void sendToRealTimeDb();

unsigned long prevMillis = 0;

void setup()
{
   Serial.begin(115200);
   delay(2000);
   t0_AP_Mode.setInterval(1000, stopAP);
   checkWiFiConfig();
   Serial.println("Setup done");
   if (currentState == STA_Mode)
   {
   Util::connectWifi();
   control.initialize();
   Util::beginTimeClient();
   connectFirebase();
   rtosTaskSetup();
   }
}

void loop()
{
   // handleState();
   // if (currentState != STA_Mode)
   //    return;

   if ((millis() - prevMillis > 500) || prevMillis == 0)
   {
      sendToRealTimeDb();
      prevMillis = millis();
   }
   control.run();
}

void connectFirebase()
{
   display.clearDisplay();
   display.println("Connecting to Firebase...");
   display.display();
   db.connectFirebase();
   db.beginMultiPathStream(parentPath);
   Firebase.RTDB.setMultiPathStreamCallback(&db.stream, streamCallback, streamTimeoutCallback);
   display.clearDisplay();
   display.println("Firebase connected !");
   display.display();
}

void rtosTaskSetup()
{
   xTaskCreatePinnedToCore(getCurrentValuesTask, "get-current-values-task", 2000, NULL, 1, &getCurrentValuesTaskHandle, 1);
   // xTaskCreatePinnedToCore(telebotNotificationTask, "auto-mode-task", 2000, NULL, 1, &teletbot_task_handle, 1);
}

void sendToRealTimeDb()
{
   FirebaseJson json;
   FirebaseJson jSensor;
   jSensor.add("light", sensor.light);
   jSensor.add("temperature", sensor.temperature);
   jSensor.add("soil", sensor.soil);
   jSensor.add("rain", sensor.rain);
   json.add("sensors", jSensor);

   json.add("mode", run_mode);

   FirebaseJson jDevice;
   jDevice.set("lamp", device.lamp);
   jDevice.set("motor", device.motor);
   jDevice.set("pump", device.pump);

   json.add("devices", jDevice);
   db.setJson("/actValues", json);
   json.clear();
}