import { Timestamp } from "firebase/firestore";

export type PredictHistory = {
    temperature: number[];
    soil: number[];
    light: number[];
    time: Timestamp;
    timeRange: string[];
};
