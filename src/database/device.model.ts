import {Timestamp} from "firebase/firestore";

export type DeviceHistory = {
    fan: boolean;
    motor: boolean;
    light: boolean;
    pump: boolean;
    time: Timestamp;
}
