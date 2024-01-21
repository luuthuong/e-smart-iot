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
        const date = startDate;
        for (let i = 0; i < num; i++) {
            await setDoc(doc(
                    firestore,
                    "History-Sensor",
                    createGuid()),
                {
                    light: rand(55, 89),
                    rain: false,
                    soil: rand(75,80),
                    temperature: rand(27, 30),
                    time: Timestamp.fromDate(date)
                } as SensorHistory);

            if(date.getHours() === 23)
                continue;
            date.setHours(date.getHours() + 1);
        }
        start.setDate(start.getDate() + 1);
        start.setHours(0);
    }
    console.log('mock success');
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
                    light: Math.random() < 0.1,
                    fan: Math.random() < 0.5,
                    motor: Math.random() < 0.4,
                    pump: Math.random() < 0.6,
                    time: Timestamp.fromDate(start)
                } as DeviceHistory);

            if(start.getHours() === 23)
                continue;
            start.setHours(start.getHours() + 1);
        }
        start.setDate(startDate.getDate() + 1);
        start.setHours(0);
    }
    console.log('mock success');
}
