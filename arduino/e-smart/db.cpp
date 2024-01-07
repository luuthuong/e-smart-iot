#include "db.h"
#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>
#include "UUID.h"

#define API_KEY "AIzaSyDW2CyYpd_sjTfqt2a76ugJ_xZUJ-x76Sc"
#define DATABASE_URL "https://e-smart-iot-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define USER_EMAIL "admin@gmail.com"
#define USER_PASSWORD "123456"
#define FIREBASE_PROJECT_ID "e-smart-iot"

Database::Database()
{
  this->_reconnect = true;
}

bool Database::canExecute()
{
  return Firebase.ready();
}

void Database::connectFirebase()
{
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  config.token_status_callback = tokenStatusCallback;

  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(this->_reconnect);
}

void Database::beginMultiPathStream(String parentPath)
{
  if (!Firebase.RTDB.beginMultiPathStream(&this->stream, parentPath))
    Serial.println("stream begin error");
}

void Database::setString(String path, String value)
{
  Firebase.RTDB.setStringAsync(&this->fbdo, path, value);
}

String Database::getString(String path)
{
  Firebase.RTDB.getString(&this->fbdo, path);
  return fbdo.to<const char *>();
}

void Database::setInt(String path, int value)
{
  Firebase.RTDB.setIntAsync(&this->fbdo, path, value);
}

int Database::getInt(String path)
{
  Firebase.RTDB.getInt(&this->fbdo, path);
  return fbdo.to<int>();
}

void Database::setBoolean(String path, bool value)
{
  Firebase.RTDB.setBoolAsync(&this->fbdo, path, value);
}

bool Database::getBoolean(String path)
{
  Firebase.RTDB.getBool(&this->fbdo, path);
  return fbdo.to<bool>();
}

void Database::setFloat(String path, float value)
{
  Firebase.RTDB.setFloatAsync(&this->fbdo, path, value);
}

float Database::getFloat(String path)
{
  Firebase.RTDB.getFloat(&this->fbdo, path);
  return fbdo.to<float>();
}

String Database::getProjectId()
{
  return FIREBASE_PROJECT_ID;
}

void Database::setJson(String path, FirebaseJson json){
  Firebase.RTDB.updateNodeSilentAsync(&this->fbdo,path, &json);
}

void Database::commitDocument(String path, FirebaseJson json)
{

  std::vector<struct fb_esp_firestore_document_write_t> writes;
  struct fb_esp_firestore_document_write_t update_write;
  update_write.type = fb_esp_firestore_document_write_type_update;
  FirebaseJson content;
  String documentPath = path + Util::createID();

  update_write.update_document_content = json.raw();
  update_write.update_document_path = documentPath.c_str();
  writes.push_back(update_write);

  struct fb_esp_firestore_document_write_t transform_write;
  transform_write.type = fb_esp_firestore_document_write_type_transform;
  transform_write.document_transform.transform_document_path = documentPath;
  struct fb_esp_firestore_document_write_field_transforms_t field_transforms;
  field_transforms.fieldPath = "time";
  field_transforms.transform_type = fb_esp_firestore_transform_type_set_to_server_value;
  field_transforms.transform_content = "REQUEST_TIME";
  transform_write.document_transform.field_transforms.push_back(field_transforms);
  writes.push_back(transform_write);

  bool result = Firebase.Firestore.commitDocument(&this->fbdo, this->getProjectId(), "", writes, "");
  if (!result)
    Serial.println(this->fbdo.errorReason());
}