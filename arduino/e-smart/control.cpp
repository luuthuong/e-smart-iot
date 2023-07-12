#include "control.h"
#include "util.h"

const String parentPath = "/test";
const String childPath[2] = {"/node1", "/node2"};
void streamCallback(MultiPathStreamData stream)
{
    size_t numChild = sizeof(childPath) / sizeof(childPath[0]);

    for (size_t i = 0; i < numChild; i++)
    {
        if (stream.get(childPath[i]))
        {
            Serial.printf("path: %s, event: %s, type: %s, value: %s%s", stream.dataPath.c_str(), stream.eventType.c_str(), stream.type.c_str(), stream.value.c_str(), i < numChild - 1 ? "\n" : "");
        }
    }
    Serial.printf("Received stream payload size: %d (Max. %d)\n\n", stream.payloadLength(), stream.maxPayloadLength());
}

void streamTimeoutCallback(bool timeout)
{
    if (timeout)
        Serial.println("stream timed out, resuming...\n");
}

void Control::autoMode()
{
    this->db.setJson("/test/json", [](FirebaseJson* json){
        json->set("id", 0);
        json->set("name", "Thuong");
        json->set("createdDate", Util::getCurrentDate());
    });
}

void Control::mannualMode()
{
}

void Control::connectFirebase()
{
    this->db.connectFirebase();
    this->db.beginMultiPathStream(parentPath);
    Firebase.setMultiPathStreamCallback(this->db.stream, streamCallback, streamTimeoutCallback);
}

void Control::run()
{
    this->autoMode();
    this->mannualMode();
    if (!this->db.stream.httpConnected())
        Serial.println("Server was disconnected!");
}

bool Control::canExecute()
{
    return this->db.canExecute();
}