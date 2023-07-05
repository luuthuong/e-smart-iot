import {Limit} from "./limit.type";
import {Device} from "./device.type";

export type Setting ={
    limits: LimitSensor;
    manualController: Device
}

export type LimitSensor ={
    light: Limit;
    soil: Limit;
    temp: Limit;
}
