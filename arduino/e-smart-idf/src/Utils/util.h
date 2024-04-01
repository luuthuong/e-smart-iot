#include "Arduino.h"

#ifndef util_h
#define util_h
class Util
{
public:
  static void connectWifi();
  static String getCurrentTime();
  static String getCurrentDate();
  static void beginTimeClient();
  static String *splitString(String str, char delimiter);
  static String createID();
};
#endif