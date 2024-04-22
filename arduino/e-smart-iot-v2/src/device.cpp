#include "device.h"
Device::Device(){
    
}
Device::Device( bool pump, bool lamp, bool motor)
{
    this->pump = pump;
    this->lamp = lamp;
    this->motor = motor;
}