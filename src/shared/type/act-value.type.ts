import {Device as DeviceType} from "./device.type";
import {Sensor} from "./sensor.type";

export type ActValue ={
    devices: DeviceType;
    mode: boolean;
    sensors: Sensor;
}
