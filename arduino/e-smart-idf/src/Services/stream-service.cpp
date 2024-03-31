#include "stream-service.h"
#include "ArduinoJson.h"

Control control;

const String childPath[3] = {"/limits", "/manualController", "/mode"};

const String LIGHT = "light";
const String TEMP = "temp";
const String SOIL = "soil";

const String HIGH_LIMIT = "high";
const String LOW_LIMIT = "low";

const String LAMP = "lamp";
const String MOTOR = "motor";
const String PUMP = "pump";

void limitChangeHandler(String path, String value, String valueType);
void pathChangeHandler(String path, String value, String valueType);
void mannualControlChangeHandler(String path, String value);
void modeChangeHandler(String path, String value);
void updateRootLimit(String path, String value);
void updateLimitChange(Limit *limit, String path, String value, String valueType, String displayName);
void mannualModeWrite(String name, int pin, bool state);


void pathChangeHandler(String path, String value, String valueType)
{
    for (size_t i = 0; i < childPath->length(); i++)
    {
        switch (i)
        {
        case 0:
            if (path.indexOf(childPath[i]) >= 0)
                limitChangeHandler(path, value, valueType);
            break;
        case 1:
            if (path.indexOf(childPath[i]) >= 0)
                mannualControlChangeHandler(path, value);
            break; 
        case 2:
            if (path.indexOf(childPath[i]) >= 0)
                modeChangeHandler(path, value);
            break;
        default:
            break;
        }
    }
}

void limitChangeHandler(String path, String value, String valueType)
{
    if (path.equals(childPath[0]))
    {
        updateRootLimit(path, value);
        return;
    }
    path.remove(0, childPath[0].length() + 1);
    String subPath = path.substring(0, path.indexOf('/'));
    path.remove(0, subPath.length() + 1);

    if (subPath.equals(LIGHT))
    {
        updateLimitChange(&lightLimit, path, value, valueType, "LIGHT");
        return;
    }

    if (subPath.equals(SOIL))
    {
        updateLimitChange(&soilLimit, path, value, valueType, "SOIL");
        return;
    }

    if (subPath.equals(TEMP))
    {
        updateLimitChange(&tempLimit, path, value, valueType, "TEMPERATURE");
        return;
    }
}

void updateRootLimit(String path, String value)
{
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, value.c_str());
    if (error)
    {
        Serial.println("Deserialize json failed!");
        Serial.println(error.f_str());
        return;
    }

    lightLimit.high = doc[LIGHT][HIGH_LIMIT].as<float>();
    lightLimit.low = doc[LIGHT][LOW_LIMIT].as<float>();

    soilLimit.high = doc[SOIL][HIGH_LIMIT].as<float>();
    soilLimit.low = doc[SOIL][LOW_LIMIT].as<float>();

    tempLimit.high = doc[TEMP][HIGH_LIMIT].as<float>();
    tempLimit.low = doc[TEMP][LOW_LIMIT].as<float>();

    Serial.println("--------LIMIT SETTING--------");
    Serial.printf("LIGHT - HIGH: %f\tLOW: %f\n", lightLimit.high, lightLimit.low);
    Serial.printf("SOIL -  HIGH: %f\tLOW: %f\n", soilLimit.high, soilLimit.low);
    Serial.printf("TEMPERATURE - HIGH: %f\tLOW: %f\n", tempLimit.high, tempLimit.low);
    Serial.println("----------------------------");
}

void updateLimitChange(Limit *limit, String path, String value, String valueType, String displayName)
{
    if (valueType == "json")
    {
        StaticJsonDocument<100> jsondoc;
        DeserializationError error = deserializeJson(jsondoc, value);
        if (error)
        {
            Serial.println("deserialize json failed!");
            Serial.println(error.f_str());
            return;
        }
        limit->high = jsondoc[HIGH_LIMIT].as<float>();
        limit->low = jsondoc[LOW_LIMIT].as<float>();
    }

    if (path.equals(HIGH_LIMIT) && valueType == "int")
        limit->high = value.toFloat();

    if (path.equals(LOW_LIMIT) && valueType == "int")
        limit->low = value.toFloat();

    Serial.printf("--------%s--------\n", displayName.c_str());
    Serial.printf("HIGH: %f\nLOW: %f\n", limit->high, limit->low);
    Serial.println("---------------------");
}

void mannualControlChangeHandler(String path, String value)
{
    if (run_mode)
        return;

    path.remove(0, childPath[1].length() + 1);
    bool active = String(value) == "true";
    if (path.equals(LAMP))
    {
        mannualModeWrite("LAMP", PIN_LAMP, active);
        return;
    }

    if (path.equals(MOTOR))
    {
        int direct = active ? RIGHT_DIRECT : LEFT_DIRECT;
        control.motorControl(DEFAULT_SPEED, direct);
        return;
    }

    if (path.equals(PUMP))
        mannualModeWrite("PUMP", PIN_PUMP, active);
}

void mannualModeWrite(String name, int pin, bool state)
{
    Serial.printf("--------MANNUAL TRIGGER--------\n");
    Serial.printf("STATE %s: %d \n", name, state);
    digitalWrite(pin, state);
    Serial.println("----------------------------");
}

void modeChangeHandler(String path, String value)
{
    run_mode = String(value) == "true";
    digitalWrite(PIN_LAMP, LOW);
    digitalWrite(PIN_PUMP, LOW);
    Serial.printf("Mode: %s\n", value);
}

void streamCallback(MultiPathStream stream)
{
    size_t childLenght = sizeof(childPath) / sizeof(childPath[0]);
    for (size_t i = 0; i < childLenght; i++)
    {
        if (stream.get(childPath[i]))
            pathChangeHandler(stream.dataPath.c_str(), stream.value.c_str(), stream.type.c_str());
    }
}

void streamTimeoutCallback(bool timeout)
{
    if (timeout)
        Serial.println("stream timed out, resuming...\n");
}
