import {DeviceFilterResponse, SensorFilterResponse} from "./filter-request";


export type HeaderTableCell =  {
    disablePadding: boolean;
    id: string;
    label: string;
    numeric: boolean;
}

export type Order = 'asc' | 'desc';

export enum ViewType {
    Device,
    Sensor
}
