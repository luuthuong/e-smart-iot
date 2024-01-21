import {DeviceHistory, SensorHistory} from "../../database";

export type PageRequest = {
    pageSize:number;
    pageIndex: number;
    type: 'prev' | 'next',
    id: string;
}

export type SensorFilterRequest = {
    from?: Date;
    to?: Date;
    keyword?: string;
    max?: number;
    min?: number;
    field?: keyof Omit<SensorHistory, 'rain' | 'time'>;
    pageRequest?: PageRequest
}

export type DeviceFilterRequest = {
    from?: Date;
    to?: Date;
    keyword?: string;
    max?: number;
    min?: number;
    pageRequest?: PageRequest
}

export type SensorFilterResponse = SensorHistory & {
    id: string;
    time: Date;
}


export type DeviceFilterResponse = DeviceHistory & {
    id: string;
    time: Date;
}
