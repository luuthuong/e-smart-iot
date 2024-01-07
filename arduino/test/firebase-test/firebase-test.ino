#include "sensor_model.h"
#include <WiFi.h>
#include <ArduinoJson.h>
#include <Firebase_ESP_Client.h>
#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>
#include "sensor_model.h"


#pragma region Wifi config
#define DEFAULT_BAUD 115200
#define WIFI_SSID "Thuong"
#define WIFI_PASSWORD "12346789"
#pragma endregion

#pragma region Firebase config
#define API_KEY "AIzaSyDW2CyYpd_sjTfqt2a76ugJ_xZUJ-x76Sc"
#define DATABASE_URL "https://e-smart-iot-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define USER_EMAIL "admin@gmail.com"
#define USER_PASSWORD "123456"
#define FIREBASE_PROJECT_ID "e-smart-iot"

FirebaseConfig config;
FirebaseAuth auth;
#pragma endregion


SensorModel sensor;

TaskHandle_t sysControlTaskHanle;
TaskHandle_t printValuesTaskHandle;
TaskHandle_t getValuesTaskHandle;


#define PIN_LAMP 13
#define PIN_PUMP 12
#define PIN_MOTOR 15

unsigned long sensor_millis = 0;

class PinModel {
public:
    int lamp;
    int motor;
    int pump;
};

void setup() 
{
    Serial.begin(DEFAULT_BAUD);
    connectWifi();
    initilizeFirebase();
    FirebaseData fbdo;
    FirebaseJson json;
    Firebase.RTDB.getJSON(&fbdo, "/test/pin", &json);
    Serial.printf("raw value: %s", json.raw());
    PinModel pin = fbdo.to<PinModel>();
    Serial.println(pin.lamp);
    Serial.println(pin.pump);
    Serial.println(pin.motor);
    taskSetup();
}

void loop()
{
    FirebaseData fbdo;
    Firebase.RTDB.getFloat(&fbdo, "/test/sensor/light");

    sensor.light = fbdo.to<int>();
    delay(1000);
}

void initilizeFirebase() {
    config.api_key = API_KEY;
    config.database_url = DATABASE_URL;
    config.token_status_callback = tokenStatusCallback;

    auth.user.email = USER_EMAIL;
    auth.user.password = USER_PASSWORD;
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);
}

void connectWifi() {
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    while (WiFi.status() != WL_CONNECTED)
    {
        Serial.println("Connectting...");
        delay(1000);
    }
    Serial.println("Connect successfully!");
    Serial.print("Adress IP: ");
    Serial.println(WiFi.localIP());
}

void sysControlTask(void* parameters) {
    for (;;) {
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}

void printValuesTask(void* parameter) {
    for (;;) {
        sensor.Print();
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}

void getValuesTask(void* parameters) {
    for (;;) {
        sensor.soil += 1;
        sensor.temperature += 1;
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}

void taskSetup() {
    xTaskCreatePinnedToCore(
        printValuesTask,
        "print-values",
        2000,
        NULL,
        1,
        &printValuesTaskHandle,
        0
    );

    xTaskCreatePinnedToCore(
        sysControlTask,
        "system-control-task",
        2000,
        NULL,
        1,
        &sysControlTaskHanle,
        1
    );

    xTaskCreatePinnedToCore(
        getValuesTask,
        "get-values",
        2000,
        NULL,
        0,
        &getValuesTaskHandle,
        0
    );
}