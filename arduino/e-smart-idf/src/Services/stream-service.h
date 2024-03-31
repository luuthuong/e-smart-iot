#include "Arduino.h"
#include "Database/db.h"
#include "Control/control.h"

extern Control control;

#ifndef StreamService_H
#define StreamService_H
const String parentPath = "/settings";

void streamCallback(MultiPathStream stream);
void streamTimeoutCallback(bool timeout);
void referenceControl(Control *control);
#endif