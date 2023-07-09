#include "Arduino.h"
#ifndef db_h
#define db_h

#define API_KEY "AIzaSyDW2CyYpd_sjTfqt2a76ugJ_xZUJ-x76Sc"
#define DATABASE_URL "https://e-smart-iot-default-rtdb.asia-southeast1.firebasedatabase.app/" 
#define USER_EMAIL "admin@gmail.com"
#define USER_PASSWORD "123456"
#define FIREBASE_PROJECT_ID "e-smart-iot"

class Database {
  private:
  public:
    Database(bool reconnect = true);
    void connectFirebase();
    void observableStreamData();
    void setJsonAsync();
    void setString(String value);
    String getString(String path);
    void setInt(int value);
    int getInt(String path);
};

#endif