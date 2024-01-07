// sensor.h

#ifndef _SENSOR_h
#define _SENSOR_h

#if defined(ARDUINO) && ARDUINO >= 100
#include "arduino.h"
#else
#include "WProgram.h"
#endif

class SensorModel {
public:
	SensorModel();
	int temperature;
	int soil;
	int light;
	void Print();
};
#endif

