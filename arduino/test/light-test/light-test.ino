#include <Wire.h>
#include <BH1750.h>

BH1750 lightMeter(0x23);

void setup() {
	Serial.begin(115200);
	Wire.begin(5,4);
	lightMeter.begin();
}

// the loop function runs over and over again until power down or reset
void loop() {
	float current = getLightValue();
	Serial.print("Current light value: ");
	Serial.println(current);
	delay(500);
}

float getLightValue() {
	float value = lightMeter.readLightLevel();
	return value < 0 ? 0 : value;
}