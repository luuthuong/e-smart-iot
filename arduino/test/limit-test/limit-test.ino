
#define PIN_LIMIT_LEFT 0
#define PIN_LIMIT_RIGHT 2

void setup() {
	Serial.begin(115200);
	pinMode(PIN_LIMIT_LEFT, INPUT);
	pinMode(PIN_LIMIT_RIGHT, INPUT);
}

void loop() {
	Serial.printf("\nLEFT: %d\n", digitalRead(PIN_LIMIT_LEFT));
	Serial.printf("RIGHT: %d\n", digitalRead(PIN_LIMIT_RIGHT));
	delay(500);
}
