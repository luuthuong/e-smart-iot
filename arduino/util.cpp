#include "util.h"
#include<WiFi.h>
#include<NTPClient.h>
#include<WiFiUdp.h>
#include "Arduino.h"

#define WIFI_SSID "TDT"
#define WIFI_PASSWORD "0869564467"
#define UTC_OFFSET_IN_SECONDS 25200

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", UTC_OFFSET_IN_SECONDS);

void Util::connectWifi(){
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.println("Connectting...");
    delay(1000);
  }
  Serial.println("Connect successfully!");
  Serial.print("Adress IP: ");
  Serial.println(WiFi.localIP());
}

void Util::beginTimeClient(){
  timeClient.begin();
}

String Util::getCurrentTime(){
  timeClient.update();
  String hr, mn, sc;
  hr = timeClient.getHours() < 10 ? "0" + String(timeClient.getHours()) : String(timeClient.getHours());
  mn = timeClient.getMinutes() < 10 ? "0" + String(timeClient.getMinutes()) : String(timeClient.getMinutes());
  sc = timeClient.getSeconds() < 10 ? "0" + String(timeClient.getSeconds()) : String(timeClient.getSeconds());
  return hr + ":" + mn + ":" + sc;
}

String Util::getCurrentDate(){
  time_t rawtime = timeClient.getEpochTime();
  struct tm*ti;
  ti = localtime (&rawtime);

  uint16_t year = ti->tm_year + 1900;
  String yearStr = String(year);

  uint8_t month = ti->tm_mon + 1;
  String monthStr = month < 10 ? "0" + String(month) : String(month);

  uint8_t day = ti->tm_mday;
  String dayStr = day < 10 ? "0" + String(day) : String(day);

  return dayStr + "-" + monthStr + "-" + yearStr;
}