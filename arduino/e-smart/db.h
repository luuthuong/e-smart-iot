#include "Arduino.h"
#include "FirebaseESP32.h"

#ifndef db_h
#define db_h
class Database
{
private:
  FirebaseConfig config;
  FirebaseAuth auth;
  FirebaseData fbdo;
  FirebaseJson* json;
  bool _reconnect;
public:
  Database();
  FirebaseData stream;
  bool canExecute();
  void connectFirebase();
  void setJson(String path, void(*callback)(FirebaseJson *));
  void beginMultiPathStream(String parentPath);
  void setString(String path, String value);
  String getString(String path);
  void setInt(String path, int value);
  int getInt(String path);
  void setBoolean(String path, bool value);
  bool getBoolean(String path);
  void setFloat(String path, float value);
  float getFloat(String path);
};
#endif