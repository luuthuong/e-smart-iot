#include "Arduino.h"
#include <WiFi.h>

#include <WiFiClientSecure.h>
#include <UniversalTelegramBot.h>
#include <Firebase_ESP_Client.h>
#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>
#include "ArduinoJson.h"

#define WIFI_SSID "Thuong"
#define WIFI_PASSWORD "12346789"
#define BOT_TOKEN "6812051387:AAFFZ3UThw0_Kb-U1aS5x5_F2qMQ8OngWV4"

#define API_KEY "AIzaSyDW2CyYpd_sjTfqt2a76ugJ_xZUJ-x76Sc"
#define DATABASE_URL "https://e-smart-iot-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define USER_EMAIL "admin@gmail.com"
#define USER_PASSWORD "123456"
#define FIREBASE_PROJECT_ID "e-smart-iot"

const unsigned long BOT_MTBS = 1000;

unsigned long data_check_last_time;
const unsigned long DATA_CHECK_MS = 10000;

WiFiClientSecure secured_client;
UniversalTelegramBot bot(BOT_TOKEN, secured_client);
unsigned long bot_lasttime;
bool Start = false;

FirebaseData fbdo;
FirebaseConfig config;
FirebaseAuth auth;
bool _reconnect;

FirebaseJson json;
FirebaseJsonData result;

void connectFirebase() {
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  config.token_status_callback = tokenStatusCallback;

  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void viewSensor(String chat_id) {
  bot.sendChatAction(chat_id, "typing");
  FirebaseJson jVal;
  Firebase.RTDB.getJSON(&fbdo, "/actValues/sensors", &jVal);
  String raw_value = jVal.raw();

  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, raw_value.c_str());
  if (error) {
    Serial.println("Deserialize json failed!");
    Serial.println(error.f_str());
    return;
  }

  int light = doc["light"].as<int>();
  int soil = doc["soil"].as<int>();
  int temperature = doc["temperature"].as<int>();
  Serial.printf("light: %d\nsoil: %d\ntemperature: %d\n", light, soil, temperature);

  String msg = "Current value of sensors:\n";
  msg += "- Light: " + String(light) + "\n";
  msg += "- Soil: " + String(soil) + "\n";
  msg += "- Temperature: " + String(temperature) + "\n";
  bot.sendMessage(chat_id, msg);
}

void viewSensorDetail(String chat_id, String display_text, String act_path, String setting_path) {
  bot.sendChatAction(chat_id, "typing");
  int actVal = 0;
  Firebase.RTDB.getInt(&fbdo, F(act_path.c_str()), &actVal);

  FirebaseJson jVal;
  Firebase.RTDB.getJSON(&fbdo, setting_path, &jVal);
  String raw_value = jVal.raw();

  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, raw_value.c_str());
  if (error) {
    Serial.println("Deserialize json failed!");
    Serial.println(error.f_str());
    return;
  }
  int high = doc["high"].as<int>();
  int low = doc["low"].as<int>();

  String msg = "Detail value of " + display_text + " sensor:\n";
  msg += "Current value: " + String(actVal) + "\n";
  msg += "Setting limit:\n";
  msg += "- High: " + String(high) + "\n";
  msg += "- Low: " + String(low) + "\n";
  bot.sendMessage(chat_id, msg);
}

void viewDevices(String chat_id) {
  bot.sendChatAction(chat_id, "typing");
  FirebaseJson jVal;
  Firebase.RTDB.getJSON(&fbdo, "/actValues/devices", &jVal);
  String raw_value = jVal.raw();

  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, raw_value.c_str());
  if (error) {
    Serial.println("Deserialize json failed!");
    Serial.println(error.f_str());
    return;
  }

  String lamp = doc["lamp"].as<bool>() ? "ON\n" : "OFF\n";
  String motor = doc["motor"].as<bool>() ? "ON\n" : "OFF\n";
  String pump = doc["pump"].as<bool>() ? "ON\n" : "OFF\n";

  String msg = "Current value of devices\n";
  msg += "- Lamp: " + lamp;
  msg += "- Pump: " + pump;
  msg += "- Motor: " + motor;
  bot.sendMessage(chat_id, msg);
}


void handleNewMessages(int numNewMessages) {
  Serial.println("message handling...");

  for (int i = 0; i < numNewMessages; i++) {
    String chat_id = bot.messages[i].chat_id;
    String text = bot.messages[i].text;

    String from_name = bot.messages[i].from_name;
    if (from_name == "")
      from_name = "Guest";

    if (text == "/view_sensors") {
      viewSensor(chat_id);
    }

    if (text == "/view_sensor_light") {
      viewSensorDetail(chat_id, "light", "/actValues/sensors/light", "/settings/limits/light");
    }

    if (text == "/view_sensor_temperature") {
      viewSensorDetail(chat_id, "temperature", "/actValues/sensors/temperature", "/settings/limits/temp");
    }

    if (text == "/view_sensor_soil") {
      viewSensorDetail(chat_id, "soil", "/actValues/sensors/soil", "/settings/limits/soil");
    }

    if (text == "/view_devices") {
      viewDevices(chat_id);
    }

    if (text == "/help") {
      String welcome = "Welcome " + from_name + " to Telegram Bot E-smart-IOT.\n";
      welcome += "This is Chat Action Bot example.\n\n";
      welcome += "/view_sensors : to view current value of sensors\n";
      welcome += "/view_sensor_light: to view detail value of light sensor.\n";
      welcome += "/view_sensor_temperature: to view detail value of temperature sensor.\n";
      welcome += "/view_sensor_soil: to view detail value of soil sensor.\n";
      welcome += "/view_devices : to view current value of devices\n";
      bot.sendMessage(chat_id, welcome);
    }
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println();

  Serial.print("Connecting to Wifi SSID ");
  Serial.print(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  secured_client.setCACert(TELEGRAM_CERTIFICATE_ROOT);  // Add root certificate for api.telegram.org
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }

  Serial.print("\nWiFi connected. IP address: ");
  Serial.println(WiFi.localIP());
  connectFirebase();
  Serial.print("Retrieving time: ");
  configTime(0, 0, "pool.ntp.org");  // get UTC time via NTP
  time_t now = time(nullptr);
  while (now < 24 * 3600) {
    Serial.print(".");
    delay(100);
    now = time(nullptr);
  }
  Serial.println(now);
}

void loop() {
  if (millis() - bot_lasttime > BOT_MTBS) {
    int numNewMessages = bot.getUpdates(bot.last_message_received + 1);

    while (numNewMessages) {
      Serial.println("got response");
      handleNewMessages(numNewMessages);
      numNewMessages = bot.getUpdates(bot.last_message_received + 1);
    }
    bot_lasttime = millis();
  }

  if (millis() - data_check_last_time > DATA_CHECK_MS) {
    dataCheckHandler();
    data_check_last_time = millis();
  }
}

String getMsgCheckData(int value, int high, int low, String display) {
  String msg = "Warning from sensor: " + display + "\n";
  if (value < high && value > low)
    return "";

  if (value > high)
    msg += "Current value is higher than the low limit setting.\n";

  if (value < low)
    msg += "Current value is low than the low limit setting.\n";

  msg += "For your information: \n";
  msg += "- Current value: " + String(value) + "\n";
  msg += "Setting:\n";
  msg += "- High: " + String(high) + "\n";
  msg += "- Low: " + String(low) + "\n";

  return msg;
}

void dataCheckHandler() {
  FirebaseJson jVal;
  Firebase.RTDB.getJSON(&fbdo, "/actValues/sensors", &jVal);
  String raw_value = jVal.raw();

  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, raw_value.c_str());
  if (error) {
    Serial.println("Deserialize json failed!");
    Serial.println(error.f_str());
    return;
  }

  int light = doc["light"].as<int>();
  int soil = doc["soil"].as<int>();
  int temperature = doc["temperature"].as<int>();


  Firebase.RTDB.getJSON(&fbdo, "/settings/limits", &jVal);
  raw_value = jVal.raw();

  error = deserializeJson(doc, raw_value.c_str());
  if (error) {
    Serial.println("Deserialize json failed!");
    Serial.println(error.f_str());
    return;
  }

  int lightHigh = doc["light"]["high"].as<int>();
  int lightLow = doc["light"]["low"].as<int>();

  int soilHigh = doc["soil"]["high"].as<int>();
  int soilLow = doc["soil"]["low"].as<int>();

  int tempHigh = doc["temp"]["high"].as<int>();
  int tempLow = doc["temp"]["low"].as<int>();

  String msgLight = getMsgCheckData(light, lightHigh, lightLow, "Light");
  String msgSoil = getMsgCheckData(soil, soilHigh, soilLow, "Soil");
  String msgTemp = getMsgCheckData(temperature, tempHigh, tempLow, "Temperature");

  String msg = "";
  if (msgLight.length() > 0)
    msg += msgLight + "\n\n";

  if (msgSoil.length() > 0)
    msg += msgSoil + "\n\n";

  if (msgTemp.length() > 0)
    msg += msgTemp + "\n";

  if (msg.length() <= 0)
    return;

  bot.sendMessage("6349227188", msg);
  // Serial.printf("LIGHT: %d - HIGH: %d - LOW: %d\n", light, lightHigh, lightLow);
  // Serial.printf("SOIL: %d - HIGH: %d - LOW: %d\n", soil, soilHigh, soilLow);
  // Serial.printf("TEMPERATURE: %d - HIGH: %d - LOW: %d\n", temperature, tempHigh, tempLow);
}
