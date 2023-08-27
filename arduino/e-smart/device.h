#ifndef device_h
#define device_h
class Device{
    public:
        Device( bool pump, bool lamp, bool motor);
        bool pump;
        bool lamp;
        bool motor;
};
#endif