#include "db.h"
#include <Arduino.h>
#include "FirebaseESP32.h"
#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>

#define API_KEY "AIzaSyDW2CyYpd_sjTfqt2a76ugJ_xZUJ-x76Sc"
#define DATABASE_URL "https://e-smart-iot-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define USER_EMAIL "admin@gmail.com"
#define USER_PASSWORD "123456"
#define FIREBASE_PROJECT_ID "e-smart-iot"

Database::Database()
{
    this->_reconnect = true;
}

bool Database::canExecute()
{
    return Firebase.ready();
}

void Database::connectFirebase()
{
    config.api_key = API_KEY;
    config.database_url = DATABASE_URL;
    config.token_status_callback = tokenStatusCallback;

    auth.user.email = USER_EMAIL;
    auth.user.password = USER_PASSWORD;
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(this->_reconnect);
}

void Database::beginMultiPathStream(String parentPath)
{
    if (!Firebase.beginMultiPathStream(this->stream, parentPath))
        Serial.println("stream begin error");
}

void Database::setString(String path, String value)
{
    Firebase.setString(this->fbdo, path, value);
}

String Database::getString(String path)
{
    Firebase.getString(this->fbdo, path);
    return fbdo.to<const char *>();
}

void Database::setInt(String path, int value)
{
    Firebase.setInt(this->fbdo, path, value);
}

int Database::getInt(String path)
{
    Firebase.getInt(this-> fbdo, path);
    return fbdo.intData();
}

void Database::setBoolean(String path, bool value)
{
    Firebase.setBool(this ->fbdo, path, value);
}

bool Database::getBoolean(String path)
{
    Firebase.getBool(this-> fbdo, path);
    return fbdo.boolData();
}

void Database::setFloat(String path, float value)
{
    Firebase.setFloat(this->fbdo, path, value);
}

float Database::getFloat(String path)
{
    Firebase.getFloat(this->fbdo, path);
    return fbdo.floatData();
}

void Database::setJson(String path, void (*callback)(FirebaseJson *))
{
    json->iteratorBegin();
    callback(json);
    Firebase.setJSONAsync(this->fbdo, path, *json);
    this->json->iteratorEnd();
}
