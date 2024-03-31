#include "telebot.h"
#include "WiFiClientSecure.h"
#include "Control/control.h"

#define BOT_TOKEN "6812051387:AAFFZ3UThw0_Kb-U1aS5x5_F2qMQ8OngWV4"
WiFiClientSecure secured_client;
UniversalTelegramBot bot(BOT_TOKEN, secured_client);

void viewSensor(String chat_id);
void viewSensorDetail(String chat_id, String display_text, float value, Limit setting);
void viewDevices(String chat_id);

void setupTelebot()
{
    secured_client.setCACert(TELEGRAM_CERTIFICATE_ROOT); // Add root certificate for api.telegram.org
    configTime(0, 0, "pool.ntp.org");                    // get UTC time via NTP
    time_t now = time(nullptr);
    while (now < 24 * 3600)
    {
        Serial.print(".");
        delay(100);
        now = time(nullptr);
    }
    Serial.println(now);
}

void handleNewMessages(int numNewMessages)
{
    Serial.println("message handling...");

    for (int i = 0; i < numNewMessages; i++)
    {
        String chat_id = bot.messages[i].chat_id;
        String text = bot.messages[i].text;

        String from_name = bot.messages[i].from_name;
        if (from_name == "")
            from_name = "Guest";

        if (text == "/view_sensors")
            viewSensor(chat_id);

        if (text == "/view_sensor_light")
            viewSensorDetail(chat_id, "light", sensor.light, lightLimit);

        if (text == "/view_sensor_temperature")
            viewSensorDetail(chat_id, "temperature", sensor.temperature, tempLimit);

        if (text == "/view_sensor_soil")
            viewSensorDetail(chat_id, "soil", sensor.soil, soilLimit);

        if (text == "/view_devices")
        {
            viewDevices(chat_id);
        }

        if (text == "/help")
        {
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

void viewSensor(String chat_id)
{
    bot.sendChatAction(chat_id, "typing");
    Serial.printf("light: %d\nsoil: %d\ntemperature: %d\n", sensor.light, sensor.soil, sensor.temperature);

    String msg = "Current value of sensors:\n";
    msg += "- Light: " + String(sensor.light) + "\n";
    msg += "- Soil: " + String(sensor.soil) + "\n";
    msg += "- Temperature: " + String(sensor.temperature) + "\n";
    bot.sendMessage(chat_id, msg);
}

void viewSensorDetail(String chat_id, String display_text, float value, Limit setting)
{
    bot.sendChatAction(chat_id, "typing");
    String msg = "Detail value of " + display_text + " sensor:\n";
    msg += "Current value: " + String(value) + "\n";
    msg += "Setting limit:\n";
    msg += "- High: " + String(setting.high) + "\n";
    msg += "- Low: " + String(setting.low) + "\n";
    bot.sendMessage(chat_id, msg);
}

void viewDevices(String chat_id)
{
    bot.sendChatAction(chat_id, "typing");
    String msg = "Current value of devices\n";
    msg += "- Lamp: " + device.lamp;
    msg += "- Pump: " + device.pump;
    msg += "- Motor: " + device.motor;
    bot.sendMessage(chat_id, msg);
}
