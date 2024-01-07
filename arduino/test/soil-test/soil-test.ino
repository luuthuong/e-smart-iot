
#define PIN_SOIL 39

void setup() {
	Serial.begin(115200);
}

void loop() {
	int current = getSoilValue();
	Serial.print("Current soil value: ");
	Serial.println(current);
	delay(500);
}

int getSoilValue() {
	int value = analogRead(PIN_SOIL);
	return (100 - map((value), 0, 4095, 0, 100));
}