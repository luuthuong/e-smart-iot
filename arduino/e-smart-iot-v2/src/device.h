#ifndef device_h
#define device_h
class Device{
    public:
        Device();
        Device( bool pump, bool lamp, bool motor);
        bool pump;
        bool lamp;
        bool motor;
};

enum MotorStateEnum
{
    NONE,
    LEFT,
    RIGHT
};
#endif