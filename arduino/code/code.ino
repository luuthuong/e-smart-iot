#include <NTPClient.h>  
#include <WiFi.h> 
#include <WiFiUdp.h>
#include <Wire.h>
#include <BH1750.h> 
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "DHT.h"
#include <PID_v1.h>
#include <analogWrite.h>  
#include <Firebase_ESP_Client.h>
#include <OneWire.h> 
#include <DallasTemperature.h>


#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>

//define pins
#define Asoil 39
#define Rain 14
#define SCREEN_WIDTH 128 
#define SCREEN_HEIGHT 64 

//define input pins limit motor
#define limitLeft 0
#define limitRight 2
#define enMotor 15

// define output pins 
#define turnRight 26
#define turnLeft 25
#define PIN_OUTPUT 13
#define Pump 12
#define Fan 1

// define limit speed of motor
#define MAX_SPEED 255 
#define MIN_SPEED 0

/* 1. Define the WiFi credentials */
#define WIFI_SSID "gardent"
#define WIFI_PASSWORD "datrinh318"

/* 2. Define the API Key */
#define API_KEY "AIzaSyDW2CyYpd_sjTfqt2a76ugJ_xZUJ-x76Sc"

/* 3. Define the RTDB URL */
#define DATABASE_URL "https://e-smart-iot-default-rtdb.asia-southeast1.firebasedatabase.app/" 

/* 4. Define the user Email and password that alreadey registerd or added in your project */
#define USER_EMAIL "admin@gmail.com"
#define USER_PASSWORD "123456"

/* 5. Define the project ID */
#define FIREBASE_PROJECT_ID "e-smart-iot"

//define sensor pin temp
#define ONE_WIRE_BUS 16
OneWire oneWire(ONE_WIRE_BUS); 
DallasTemperature sensors(&oneWire);

// Define Firebase Data object
FirebaseData fbdo;
FirebaseData stream;
FirebaseAuth auth;
FirebaseConfig config;
unsigned long sendDataPrevMillis = 0;
unsigned long dataMillis = 0;
unsigned long displayMillis = 0;

// declare variables
int value, real_value, globalTemp, globalSoil, globalLight, globalRight, globalLeft, globalFan;
bool globalRain;
String globalCurrentDate, globalCurrentTime;
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
BH1750 lightMeter(0x23);

// declare var to get values from firebase
String parentPath = "/settings";
String childPath[3] = {"/limits", "/mannualController", "/mode"};
int count = 0;
volatile bool dataChanged = false;


// declare real time
String path = "/";
String months[12] = {"01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"};
String TimeNow;
String formattedTime;
String tmptime;
String tmpdate;
const long utcOffsetInSeconds = 25200;
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", utcOffsetInSeconds);

//declare values of manual mode
int statePump, stateMotor, stateLamp, Mode, stateFan;

// declare limit values
int tHigh = 30;
int tLow = 27;
int sHigh = 40;
int sLow = 5;
int lHigh = 800;
int lLow = 300; 

//*************PID************//
double Setpoint, Input, Output;
double consKp = 36, consKi = 0.07, consKd = 2.7;
PID myPID(&Input, &Output, &Setpoint, consKp, consKi, consKd, DIRECT);
int setpointTemp;

void setup() {
  
  Serial.begin(9600);
  connectWifi();
  timeClient.begin();
  Wire.begin(5,4);
  lightMeter.begin();
  sensors.begin(); 
  
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C); 
  display.clearDisplay();
  display.setTextSize(1.8);
  display.setTextColor(WHITE);
  display.setCursor(0, 30);
  display.println("Have a nice day, sir!");
  display.display();
  delay(2000);
  display.clearDisplay();

  pinMode(limitRight, INPUT);
  pinMode(limitLeft, INPUT);
  pinMode(Pump, OUTPUT);
  pinMode(turnLeft, OUTPUT);
  pinMode(turnRight, OUTPUT);
  pinMode(enMotor, OUTPUT);
  pinMode(Fan, OUTPUT);
  
  //turn off motor
  digitalWrite(turnLeft, LOW);
  digitalWrite(turnRight, LOW);
  
  
  //***********PID**********//
  Setpoint = map(setpointTemp , 0, 100, 0, 4095);
  myPID.SetOutputLimits(0, 255); // You can adjust value here
  myPID.SetSampleTime(10); // time 0.01s
  myPID.SetMode(AUTOMATIC);
  
  //***********FREE RTOS**********//
   xTaskCreate(
      task, //function name
      "Task", // task name
      4000, //task size,
      NULL, //task parameter
      1, // task priority
      NULL// task handle 
    );
    
  //**********FIREBASE************//
    config.api_key = API_KEY;
    auth.user.email = USER_EMAIL;
    auth.user.password = USER_PASSWORD;
    config.database_url = DATABASE_URL;
    config.token_status_callback = tokenStatusCallback;
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);
    if (!Firebase.RTDB.beginMultiPathStream(&stream, parentPath))
    Serial.printf("sream begin error, %s\n\n", stream.errorReason().c_str());
    Firebase.RTDB.setMultiPathStreamCallback(&stream, streamCallback, streamTimeoutCallback);
}

void loop() {
  
  // get global values of sensors
  getGlobalValues();
  
  // display values on OLED
  displayValues();
  
  //switch mode
  if (Mode == false){
    autoMode();
    Serial.println("Mode is auto");
  }else{
    manMode();
    Serial.println("Mode is manual");
  }
  
  // update data to realtime firebase
  updateDataToFireBase();
  
  //update data to firestore
  if (Firebase.ready() && (millis() - dataMillis > 600000 || dataMillis == 0))
  {      
    syncDataToFireStore2();
    syncDataToFireStore();
    dataMillis = millis();
  }
}
// fuction to get values from firebase ( manual mode )
void childPathMode(int value, String path) {
  if (path.indexOf("/Mode") >= 0) {
    Mode = value;
  }
}

void childPathLimit(int value, String path) {
  if (path.indexOf("/limits/light/high") >= 0) {
    lHigh = value;
    Serial.println("light high: " + String(lHigh));
  }
  else if (path.indexOf("/limits/light/low") >= 0) {
    lLow = value;
    Serial.println("Light Low: " + String(lLow));
  }
  else if (path.indexOf("/limits/soil/high") >= 0) {
    sHigh = value;
    Serial.println("soil High: " + String(sHigh));
  }
  else if (path.indexOf("/limits/soil/low") >= 0) {
    sLow = value;
    Serial.println("Soil Low: " + String(sLow));
  }
  else if (path.indexOf("/limits/temp/high") >= 0) {
    tHigh = value;
    setpointTemp = tHigh;
    Serial.println(setpointTemp);
    Serial.println("Temp High: " + String(tHigh));
    
  }
  else if (path.indexOf("/limits/temp/low") >= 0) {
    tLow = value;
    Serial.println("Temp Low: " + String(tLow));
  }
}

// Auto Mode
void autoMode() {
  // right to close gate, left to open gate
  if (globalRain == true && globalSoil > sHigh)
  {
    ctrMotor_Right(160);
  }
  else{
    ctrMotor_Left(160);
  }
  // range form lLow to lHight
  if (globalLight < lLow || globalLight > lHigh)
  {
     ctrMotor_Right(160);
  }
  else if (globalLight > lLow  &&  globalLight < lHigh)
  {
    ctrMotor_Left(160);
  }

  if (globalSoil < sLow) {
    digitalWrite(Pump, HIGH);
  }
  else if ( globalSoil > sHigh)
  {
    digitalWrite(Pump, LOW);
  }
//  else{
//    digitalWrite(Pump, LOW);
//  }
  
}

void childPathMan(int value, String path) {
  if (path.indexOf("/Manual/Warm") >= 0) {
    stateLamp = value;
    Serial.println(stateLamp);
  }
  else if (path.indexOf("/Manual/Motor") >= 0) {
    stateMotor = value;
    Serial.println(stateMotor);
  }
  else if (path.indexOf("/Manual/Pump") >= 0) {
    statePump = value;
    Serial.println(statePump);
  }
  else if (path.indexOf("/Manual/Fan") >= 0) {
    stateFan = value;
    Serial.println(stateFan);
  }
}

// ************FREE RTOS ****************//
void task (void* parameters)
{
  for(;;){
    //***********PID************//
     Serial.println(stateLamp);
    if(stateLamp == 1 ){
      Serial.println("into PID mode");
      Setpoint = map(setpointTemp , 0, 100, 0, 4095);
      myPID.Compute();
      Input =  map(globalTemp, 0, 100, 0, 4095);
      // analogWrite(PIN_OUTPUT, 2);
      vTaskDelay(10 / portTICK_PERIOD_MS); // delay 10ms
   }
  }
}

void streamCallback(MultiPathStream stream)
{
  size_t numChild = sizeof(childPath) / sizeof(childPath[0]);

  for (size_t i = 0; i < numChild; i++)
  {
    if (stream.get(childPath[i]))
    {
      Serial.printf("path: %s, event: %s, type: %s, value: %s%s", stream.dataPath.c_str(), stream.eventType.c_str(), stream.type.c_str(), stream.value.c_str(), i < numChild - 1 ? "\n" : "");
      childPathLimit(stream.value.toInt(), stream.dataPath.c_str());
      childPathMan(stream.value.toInt(), stream.dataPath.c_str());
      childPathMode(stream.value.toInt(), stream.dataPath.c_str());
    }
  }
  Serial.println();
  dataChanged = true;
}

void streamTimeoutCallback(bool timeout)
{
  if (timeout)
    Serial.println("stream timed out, resuming...\n");

  if (!stream.httpConnected())
    Serial.printf("error code: %d, reason: %s\n\n", stream.httpCode(), stream.errorReason().c_str());
}


// control manual mode 
void ctrMan(int state, uint8_t pin) {
  if ( state == 1){
      digitalWrite(pin, HIGH);
  }else{
      digitalWrite(pin, LOW);
  }

}

void manMode(){
//  ctrMan(stateLamp, PIN_OUTPUT);
  ctrMan(statePump, Pump);
  ctrMan(stateFan, Fan);
  if( stateMotor == 1){
     ctrMotor_Right(160); 
  }
  else if ( stateMotor == 0){
    ctrMotor_Left(160);
  }
}


void ctrMotor_Right(int speed){
  speed = constrain(speed, MIN_SPEED, MAX_SPEED);
  digitalWrite(turnRight, HIGH);
  digitalWrite(turnLeft, LOW);
  analogWrite(enMotor, speed);
  if ( globalRight == 0){
    digitalWrite(turnRight, LOW);
    digitalWrite(turnLeft, LOW);
  } 
}

void ctrMotor_Left(int speed){
  if ( globalLeft == 0){
    digitalWrite(turnRight, LOW);
    digitalWrite(turnLeft, LOW);
  } 
  else if (globalLeft == 1){
      speed = constrain(speed, MIN_SPEED, MAX_SPEED);
      digitalWrite(turnRight, LOW);
      digitalWrite(turnLeft, HIGH);
      analogWrite(enMotor, speed);
  }
}

void getGlobalValues(){
  sensors.requestTemperatures();
  globalTemp = (int)tempSensor();
  globalSoil = (int)soilSensor();
  globalRain = rainSensor();
  globalLight = (int)lightSensor();
  globalCurrentDate = getdate();
  globalCurrentTime = gettime();
  globalRight = digitalRead(limitRight);
  globalLeft = digitalRead(limitLeft);

}

void syncDataToFireStore2(){
        Serial.print("Commit a document (append array)... ");
        std::vector<struct fb_esp_firestore_document_write_t> writes;
        struct fb_esp_firestore_document_write_t transform_write;
        transform_write.type = fb_esp_firestore_document_write_type_transform;
        transform_write.document_transform.transform_document_path = "History-Device/" + globalCurrentDate;
        struct fb_esp_firestore_document_write_field_transforms_t field_transforms;
        field_transforms.fieldPath = "Value";
        field_transforms.transform_type = fb_esp_firestore_transform_type_append_missing_elements;
        FirebaseJson content;
        
        content.set("values/[0]/mapValue/fields/Lamp/integerValue", stateLamp);
        content.set("values/[0]/mapValue/fields/Pump/integerValue", statePump);
        content.set("values/[0]/mapValue/fields/Fan/integerValue", stateFan);
        content.set("values/[0]/mapValue/fields/Motor/integerValue", stateMotor);
        content.set("values/[0]/mapValue/fields/Time/stringValue", getdate()+" "+gettime());
        
        // Set the transformation content.
        field_transforms.transform_content = content.raw();

        // Add a field transformation object to a write object.
        transform_write.document_transform.field_transforms.push_back(field_transforms);

        // Add a write object to a write array.
        writes.push_back(transform_write);

        if (Firebase.Firestore.commitDocument(&fbdo, FIREBASE_PROJECT_ID, "" /* databaseId can be (default) or empty */, writes /* dynamic array of fb_esp_firestore_document_write_t */, "" /* transaction */))
            Serial.printf("ok\n%s\n\n", fbdo.payload().c_str());
        else
            Serial.println(fbdo.errorReason());
}

void syncDataToFireStore(){
        Serial.print("Commit a document (append array)... ");
        std::vector<struct fb_esp_firestore_document_write_t> writes;
        struct fb_esp_firestore_document_write_t transform_write;
        transform_write.type = fb_esp_firestore_document_write_type_transform;
        transform_write.document_transform.transform_document_path = "History-Sensor/" + globalCurrentDate;
        struct fb_esp_firestore_document_write_field_transforms_t field_transforms;
        field_transforms.fieldPath = "Value";
        field_transforms.transform_type = fb_esp_firestore_transform_type_append_missing_elements;
        FirebaseJson content;
       
        content.set("values/[0]/mapValue/fields/Light/integerValue", globalLight); 
        content.set("values/[0]/mapValue/fields/Rain/integerValue", (int) globalRain); 
        content.set("values/[0]/mapValue/fields/Soil/integerValue", globalSoil); 
        content.set("values/[0]/mapValue/fields/Temperature/integerValue", globalTemp);
        content.set("values/[0]/mapValue/fields/Time/stringValue", getdate()+" "+gettime());
        
        // Set the transformation content.
        field_transforms.transform_content = content.raw();

        // Add a field transformation object to a write object.
        transform_write.document_transform.field_transforms.push_back(field_transforms);

        // Add a write object to a write array.
        writes.push_back(transform_write);

        if (Firebase.Firestore.commitDocument(&fbdo, FIREBASE_PROJECT_ID, "" /* databaseId can be (default) or empty */, writes /* dynamic array of fb_esp_firestore_document_write_t */, "" /* transaction */))
            Serial.printf("ok\n%s\n\n", fbdo.payload().c_str());
        else
            Serial.println(fbdo.errorReason());
}

// Get Time
String gettime() {
  timeClient.update();
  String hr, mn, sc;
  hr = timeClient.getHours() < 10 ? "0" + String(timeClient.getHours()) : String(timeClient.getHours());
  mn = timeClient.getMinutes() < 10 ? "0" + String(timeClient.getMinutes()) : String(timeClient.getMinutes());
  sc = timeClient.getSeconds() < 10 ? "0" + String(timeClient.getSeconds()) : String(timeClient.getSeconds());

  return hr + ":" + mn + ":" + sc;
}

//Get date
String getdate() {
  timeClient.update();
  time_t rawtime = timeClient.getEpochTime();
  struct tm*ti;
  ti = localtime (&rawtime);

  uint16_t year = ti->tm_year + 1900;
  String yearStr = String(year);

  uint8_t month = ti->tm_mon + 1;
  String monthStr = month < 10 ? "0" + String(month) : String(month);

  uint8_t day = ti->tm_mday;
  String dayStr = day < 10 ? "0" + String(day) : String(day);

  return dayStr + "-" + monthStr + "-" + yearStr;
}

void updateDataToFireBase(){
    if (Firebase.ready() && (millis() - sendDataPrevMillis > 500 || sendDataPrevMillis == 0))
    {
        sendDataPrevMillis = millis();
        FirebaseJson json;
        json.setDoubleDigits(3);
        
        json.iteratorBegin();
        json.add("Lamp", stateLamp);
        json.add("Motor", stateMotor);
        json.add("Pump", statePump);
        json.add("Fan", stateFan);
        
        json.add("Temperature", globalTemp);
        json.add("Light", globalLight);
        json.add("Soil", globalSoil);
        json.add("Rain", globalRain);
        Serial.printf("Set json... %s\n", Firebase.RTDB.setJSON(&fbdo, "/ActValue/", &json) ? "ok" : fbdo.errorReason().c_str());
        json.iteratorEnd();
        
    }
}

void connectWifi(){
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connecting to Wi-Fi");
    while (WiFi.status() != WL_CONNECTED)
    {
        Serial.print(".");
        delay(300);
    }
    Serial.println();
    Serial.print("Connected with IP: ");
    Serial.println(WiFi.localIP());
    Serial.println();
}

// Function to display values of sensors
void displayValues(){
  display.clearDisplay();
  display.setCursor(0, 10);
  display.print("Soil: ");
  display.print(globalSoil);
  display.print(" %");
  display.setCursor(0, 30);
  display.print("Temp: ");
  display.print(globalTemp);
  display.print(" C");
  display.setCursor(0, 50);
  display.print("Light: ");
  display.print(globalLight);
  display.print(" %");
  display.display();
}

// function to read values of sensor
bool rainSensor() {
  return digitalRead(Rain)== LOW ;
}

volatile int soilSensor(){
  int Soil = analogRead(Asoil);
  return (100 - map((Soil), 0, 4095, 0, 100));
}

volatile float lightSensor(){
  float lux = lightMeter.readLightLevel();
  return lux;
}

volatile float tempSensor(){
  float t = (sensors.getTempCByIndex(0));  
  return t;
}