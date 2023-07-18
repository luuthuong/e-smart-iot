import {Timestamp} from "firebase/firestore";

export type SensorHistory ={
    light: number;
    rain: boolean;
    soil: number;
    temperature: number;
    time: Timestamp;
}
