#include "Arduino.h"
#include "telebot.h"

#ifndef rtos_task_h
#define rtos_task_h
extern TaskHandle_t getCurrentValuesTaskHandle;
extern TaskHandle_t teletbot_task_handle;
void getCurrentValuesTask(void *parameter);
void telebotNotificationTask(void *parameter);
#endif