#define IN1	26
#define IN2	13
#define IN3	15
#define IN4	25
#define MAX_SPEED 255 //từ 0-255
#define MIN_SPEED 0
void setup()
{
	pinMode(IN1, OUTPUT);
	pinMode(IN2, OUTPUT);
	pinMode(IN3, OUTPUT);
	pinMode(IN4, OUTPUT);
}

void motor_1_Dung() {
	digitalWrite(IN1, LOW);
	digitalWrite(IN2, LOW);
}

void motor_2_Dung() {
	digitalWrite(IN3, LOW);
	digitalWrite(IN4, LOW);
}

void motor_1_Tien(int speed) { //speed: từ 0 - MAX_SPEED
	speed = constrain(speed, MIN_SPEED, MAX_SPEED);//đảm báo giá trị nằm trong một khoảng từ 0 - MAX_SPEED - http://arduino.vn/reference/constrain
	digitalWrite(IN1, HIGH);// chân này không có PWM
	analogWrite(IN2, 255 - speed);
}

void motor_1_Lui(int speed) {
	speed = constrain(speed, MIN_SPEED, MAX_SPEED);//đảm báo giá trị nằm trong một khoảng từ 0 - MAX_SPEED - http://arduino.vn/reference/constrain
	digitalWrite(IN1, LOW);// chân này không có PWM
	analogWrite(IN2, speed);
}

void motor_2_Tien(int speed) { //speed: từ 0 - MAX_SPEED
	speed = constrain(speed, MIN_SPEED, MAX_SPEED);//đảm báo giá trị nằm trong một khoảng từ 0 - MAX_SPEED - http://arduino.vn/reference/constrain
	analogWrite(IN3, speed);
	digitalWrite(IN4, LOW);// chân này không có PWM
}

void motor_2_Lui(int speed) {
	speed = constrain(speed, MIN_SPEED, MAX_SPEED);//đảm báo giá trị nằm trong một khoảng từ 0 - MAX_SPEED - http://arduino.vn/reference/constrain
	analogWrite(IN4, 255 - speed);
	digitalWrite(IN3, HIGH);// chân này không có PWM
}

void loop()
{
	//motor_1_Tien(100); // motor 1 tiến
	//delay(5000);//tiến 5 s
	motor_2_Lui(100); //motor 2 lùi
	//// motor 1 vẫn tiến
	//delay(2000);//tiến 2 s
	//motor_1_Dung();
	//motor_2_Dung();
	//delay(10000);//dừng 10s
	delay(10000);
	motor_2_Dung();
	delay(2000);
}