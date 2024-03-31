#include "rtos-tasks.h"
#include "Control/control.h"
#include "stream-service.h"

TaskHandle_t getCurrentValuesTaskHandle;
TaskHandle_t teletbot_task_handle;

void displaySensorValues();
void getSensorValues();
void getDeviceValues();
void displaySensorValues();


void getCurrentValuesTask(void *parameter)
{
    for (;;)
    {
        getSensorValues();
        getDeviceValues();
        displaySensorValues();
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}

void getSensorValues()
{
    sensor.light = getLightValue();
    sensor.soil = getSoilValue();
    sensor.temperature = getTemperatureValue();
    sensor.rain = getRainValue();
}

void getDeviceValues()
{
    device.lamp = digitalRead(PIN_LAMP);
    device.motor = !digitalRead(PIN_LIMIT_RIGHT);
    device.pump = digitalRead(PIN_PUMP);
}

void displaySensorValues()
{
    display.clearDisplay();
    display.setCursor(0, 0);
    display.print("Time: ");
    display.print(Util::getCurrentTime());

    display.setCursor(90, 0);
    display.print("Rain:");
    display.print(sensor.rain ? 1 : 0);

    display.setCursor(0, 15);
    display.print("S:");
    display.print((int)sensor.soil);
    display.print("%");

    display.setCursor(53, 15);
    display.print("H/L: ");
    display.print((int)soilLimit.high);
    display.print("/");
    display.print((int)soilLimit.low);

    display.setCursor(0, 30);
    display.print("T:");
    display.print((int)sensor.temperature);
    display.print("C");

    display.setCursor(53, 30);
    display.print("H/L: ");
    display.print((int)tempLimit.high);
    display.print("/");
    display.print((int)tempLimit.low);

    display.setCursor(0, 45);
    display.print("L:");
    display.print((int)sensor.light);
    display.print("%");

    display.setCursor(53, 45);
    display.print("H/L: ");
    display.print((int)lightLimit.high);
    display.print("/");
    display.print((int)lightLimit.low);
    display.display();
}

void telebotNotificationTask(void *parameter)
{
    for (;;)
    {
        int numNewMessages = bot.getUpdates(bot.last_message_received + 1);

        while (numNewMessages)
        {
            Serial.println("got response");
            handleNewMessages(numNewMessages);
            numNewMessages = bot.getUpdates(bot.last_message_received + 1);
        }
        vTaskDelay(500 / portTICK_PERIOD_MS);
    }
}

