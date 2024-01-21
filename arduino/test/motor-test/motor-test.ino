#define PIN_EN_MOTOR 15
#define PIN_TURN_RIGHT 26
#define PIN_TURN_LEFT 25

#define PIN_LIMIT_LEFT 0
#define PIN_LIMIT_RIGHT 2
#define MAX_SPEED 255 //từ 0-255
#define MIN_SPEED 0

#define LEFT_DIRECT 0
#define RIGHT_DIRECT 1

void setup()
{
	pinMode(PIN_LIMIT_RIGHT, INPUT);
	pinMode(PIN_LIMIT_LEFT, INPUT);
	pinMode(PIN_TURN_LEFT, OUTPUT);
	pinMode(PIN_TURN_RIGHT, OUTPUT);
	pinMode(PIN_EN_MOTOR, OUTPUT);
}

void loop()
{
    motorControl(160, RIGHT_DIRECT);
	delay(500);
}


// direct = 0 LEFT, direct =  1 RIGHT
void motorControl(int speed, int direct) {
    int limitLeft = digitalRead(PIN_LIMIT_LEFT);
    int limitRight = digitalRead(PIN_LIMIT_RIGHT);
    speed = (speed, MIN_SPEED, MAX_SPEED);
    analogWrite(PIN_EN_MOTOR, speed);
    if ((direct == LEFT_DIRECT && limitLeft == LOW) || (direct == RIGHT_DIRECT && limitRight == LOW)) {
        digitalWrite(PIN_TURN_LEFT, LOW);
        digitalWrite(PIN_TURN_RIGHT, LOW);
        digitalWrite(PIN_EN_MOTOR, LOW);
        return;
    }
    switch (direct) {
    case LEFT_DIRECT:
        digitalWrite(PIN_TURN_RIGHT, LOW);
        digitalWrite(PIN_TURN_LEFT, HIGH);
        break;
    case RIGHT_DIRECT:
        digitalWrite(PIN_TURN_RIGHT, HIGH);
        digitalWrite(PIN_TURN_LEFT, LOW);
        break;
    default:
        return;
    }
}