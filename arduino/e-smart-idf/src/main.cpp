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
   control.initialize();
   control.initDisplay();
   display.setCursor(0, 30);
   std::string wifiAP = "WIFI_AP: ";
   std::string ipAddress = "192.168.4.1";
   std::string message = wifiAP + ipAddress;
   display.println(message.c_str());
   t0_AP_Mode.setInterval(1000, stopAP);
   checkWiFiConfig();
   Serial.println("Setup done");
   if (currentState == STA_Mode)
   {
      display.clearDisplay();
      Util::beginTimeClient();
      connectFirebase();
      setupTelebot();
      rtosTaskSetup();
   }
}

void loop()
{
   handleState();
   if (currentState != STA_Mode)
      return;

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
   xTaskCreatePinnedToCore(getCurrentValuesTask, "get-current-values-task", 2000, NULL, 1, &getCurrentValuesTaskHandle, 0);
   xTaskCreatePinnedToCore(telebotNotificationTask, "auto-mode-task", 2000, NULL, 1, &teletbot_task_handle, 1);
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

   json.add("mode", mode);

   FirebaseJson jDevice;
   jDevice.set("lamp", device.lamp);
   jDevice.set("motor", device.motor);
   jDevice.set("pump", device.pump);

   json.add("devices", jDevice);
   db.setJson("/actValues", json);
   json.clear();
}