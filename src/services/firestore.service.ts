import {
    collection,
    doc,
    endBefore,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    startAfter,
    Timestamp,
    where
} from "firebase/firestore";
import {firestore} from "../database";
import {HISTORY_DEVICE, HISTORY_SENSOR} from "../shared/constant";
import {DeviceFilterRequest, DeviceFilterResponse, SensorFilterRequest, SensorFilterResponse} from "../shared";


export const getHistoryDeviceByFilter = async (request: DeviceFilterRequest ): Promise<DeviceFilterResponse[]> =>{
    const deviceRef = collection(firestore, HISTORY_DEVICE);
    const _query: any = [

    ];
    if(request.from)
        _query.push(
            where(
                "time", ">=", Timestamp.fromDate(request.from)
            )
        );
        
    if (request.to)
        _query.push(where(
            "time", "<=", Timestamp.fromDate(<Date>request.to)
        ));

    _query.push(
        orderBy(
            "time",
            "desc"
        )
    )

    _query.push(
        limit(150)
    )

    const q = query(deviceRef, ..._query);
    const snapshot = await getDocs(q);
    return snapshot.docs?.map(item => ({
        ...item.data(),
        id: item.id,
        time: item.data().time.toDate()
    } as DeviceFilterResponse))
}

export const getHistorySensorByFilter = async (request: SensorFilterRequest): Promise<SensorFilterResponse[]> => {
    const sensorRef = collection(firestore, HISTORY_SENSOR);

    const _query: any = [];
    if(request.from)
       _query.push( where(
           "time", ">=", Timestamp.fromDate(request.from)
       ))
    if (request.to)
        _query.push(where(
            "time", "<=", Timestamp.fromDate(<Date>request.to)
        ));

    if (request?.field) {
        if (request.min)
            _query.push(
                where(
                    request.field, '>=', request.min
                )
            );

        if (request.max)
            _query.push(
                where(
                    request.field, "<=", request.max
                )
            )
    }

    _query.push(
        orderBy(
            "time",
            "desc"
        )
    )

    _query.push(
        limit(150)
    )

    const q = query(sensorRef, ..._query);
    const snapshot = await getDocs(q);
    return snapshot.docs?.map(item => ({
        ...item.data(),
        id: item.id,
        time: item.data().time.toDate()
    } as SensorFilterResponse))
}
