#include <Arduino.h>
#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define ONE_WIRE_BUS 16

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature temperature_sensor(&oneWire);

void setup() {
	Serial.begin(115200);
	Wire.begin(5, 4);
	temperature_sensor.begin();
}

void loop() {
	float current = getTemperatureValue();
	Serial.printf("Current Degree: ");
	Serial.println(current);
	delay(500);
}  


float getTemperatureValue() {
	temperature_sensor.requestTemperatures();
	float value = temperature_sensor.getTempCByIndex(0);
	return value < 0 ? 0 : value;
}