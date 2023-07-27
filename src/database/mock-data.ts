import {doc, setDoc, Timestamp} from "firebase/firestore";
import {firestore} from "./config";
import {SensorHistory} from "./sensor.model";
import {DeviceHistory} from "./device.model";


const rand = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const createGuid = (): string => {
    let d = new Date().getTime();
    const guid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return guid;
}

export const mockSensorStore = async (startDate: Date, endDate: Date, num: number = 10) => {
    let start = startDate;
    while (start <= endDate) {
        for (let i = 0; i < num; i++) {
            await setDoc(doc(
                    firestore,
                    "History-Sensor",
                    createGuid()),
                {
                    light: rand(30, 70),
                    rain: false,
                    soil: rand(75,80),
                    temperature: rand(27, 30),
                    time: Timestamp.fromDate(start)
                } as SensorHistory);
        }
        start.setDate(start.getDate() + 1);
    }
}

export const mockDeviceStore = async (startDate: Date, endDate: Date, num: number = 10) => {
    let start = startDate;
    while (start < endDate) {
        for (let i = 0; i < num; i++) {
            await setDoc(doc(
                    firestore,
                    "History-Device",
                    createGuid()),
                {
                    light: true,
                    fan: true,
                    motor: true,
                    pump: true,
                    time: Timestamp.fromDate(startDate)
                } as DeviceHistory);
        }
        start.setDate(startDate.getDate() + 1);
    }
}
