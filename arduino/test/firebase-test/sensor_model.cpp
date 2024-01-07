
#include "sensor_model.h"
SensorModel::SensorModel() {
	this->light = 0;
	this->soil = 0;
	this->temperature = 0;
}

void SensorModel::Print()
{
	Serial.println("VALUE:");
	Serial.printf("\tLight: %d\n\tSoil: %d\n\tTemperature: %d\n", this->light, this->soil, this->temperature);
}


