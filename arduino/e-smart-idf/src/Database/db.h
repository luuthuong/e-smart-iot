#include <Firebase_ESP_Client.h>

#ifndef db_h
#define db_h
class Database
{
private:
  FirebaseConfig config;
  FirebaseAuth auth;
  bool _reconnect;
public:
  Database();
  FirebaseData stream;
  FirebaseData fbdo;
  bool canExecute();
  void connectFirebase();
  void beginMultiPathStream(String parentPath);
  void setString(String path, String value);
  String getString(String path);
  void setInt(String path, int value);
  int getInt(String path);
  void setBoolean(String path, bool value);
  bool getBoolean(String path);
  void setFloat(String path, float value);
  float getFloat(String path);
  String getProjectId();
  void setJson(String path, FirebaseJson json);
  void setJsonAsync(String path, FirebaseJson json);
  void commitDocument(String path, FirebaseJson json);
};
#endif