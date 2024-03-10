import React, { useEffect, useState } from "react";
import {
    IonButton,
    IonButtons,
    IonCol,
    IonGrid,
    IonIcon,
    IonRouterLink,
    IonRow,
    IonTitle,
} from "@ionic/react";
import { homeOutline, refreshOutline } from "ionicons/icons";
import * as tf from "@tensorflow/tfjs";
import Chart, { Props } from "react-apexcharts";
import {
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    Timestamp,
} from "firebase/firestore";
import { firestore } from "../../database";
import { HISTORY_SENSOR } from "../../shared/constant";
import {
    FormControl,
    InputLabel,
    LinearProgress,
    MenuItem,
    Select,
} from "@mui/material";
import { ModelPredict, PredictFactory } from "./predictions/prediction-factory";
import moment from "moment";
import { Sensor } from "../../shared";
import { ApexOptions } from "apexcharts";

export const PredictVisualization = () => {
    const getNext7Days = () => {
        const currentDate = new Date();
        const next7Days: string[] = [];
        for (let i = 1; i < 8; i++) {
            const nextDate = new Date(currentDate);
            nextDate.setDate(currentDate.getDate() + i);
            const formattedDate = moment(nextDate).format("DD-MM");
            next7Days.push(formattedDate);
        }
        return next7Days;
    };
    const options: ApexOptions & {
        getTextTitle?(): string;
    } = {
        chart: {
            type: "line",
        },
        title: {
            text: "Predict chart",
            align: "center",
        },
        xaxis: {
            categories: getNext7Days(),
        },
    };
    const series: {
        [x in keyof Sensor]: ApexAxisChartSeries;
    } = {
        light: [],
        soil: [],
        temperature: [],
    };
    const [serieState, setSerieState] = useState<{
        [x in keyof Sensor]: ApexAxisChartSeries;
    }>({
        light: [],
        soil: [],
        temperature: [],
    });

    const chartTitle: Record<keyof Sensor, string> = {
        light: "Predict light",
        soil: "Predict soil",
        temperature: "Predict temperature",
    };

    const [current, setCurrent] = useState<any>(undefined);
    const [chartLoading, setChartLoading] = useState<(keyof Sensor)[]>([]);

    const [modelType, setModelType] = useState<ModelPredict>(ModelPredict.NONE);
    let sensorData: Sensor[] = [];

    const getData = () => {
        const sensorRef = collection(firestore, HISTORY_SENSOR);
        const queryCollection = [orderBy("time", "desc"), limit(300)];
        return getDocs(query(sensorRef, ...queryCollection)).then((res) => {
            return (sensorData = res.docs.map(
                (x) =>
                    ({
                        ...x.data(),
                    } as Sensor)
            ));
        });
    };

    useEffect(() => {
        if (modelType === ModelPredict.NONE) return;

        const keys: (keyof Sensor)[] = ["light", "soil", "temperature"];
        const loading = new Set(keys);
        setChartLoading(keys);
        getData().then((result) => {
            keys.forEach((key) => {
                PredictFactory[modelType](result.map((x) => x[key])).then(
                    (res) => {
                        const predicted = res.map(Math.round);
                        setSerieState((curr) => ({
                            ...curr,
                            [key]: [
                                {
                                    data: [...predicted] as number[],
                                },
                            ] as ApexAxisChartSeries,
                        }));
                        loading.delete(key);
                        setChartLoading([...loading]);
                    }
                );
            });
        });
    }, [modelType]);

    return (
        <div className={"px-4 w-full"}>
            <div className={"mt-2 flex  justify-end mr-2 items-center"}>
                <IonTitle className={"font-bold text-gray-600 text-2xl"}>
                    Predict Visualization For Tomorrow
                </IonTitle>
                <IonButtons>
                    <IonButton color={"light"} fill={"solid"}>
                        <IonIcon slot={"start"} icon={refreshOutline} />
                        <span>Refresh</span>
                    </IonButton>
                    <IonRouterLink routerLink={"/system"}>
                        <IonButton color={"light"} fill={"solid"}>
                            <IonIcon slot={"start"} icon={homeOutline} />
                            <span>Go to home</span>
                        </IonButton>
                    </IonRouterLink>
                </IonButtons>
            </div>
            <FormControl className="my-2">
                <InputLabel id="demo-simple-select-label">Model</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    value={modelType}
                    onChange={(e) =>
                        setModelType(e.target.value as ModelPredict)
                    }
                >
                    <MenuItem value={ModelPredict.NONE}>NONE</MenuItem>
                    <MenuItem value={ModelPredict.RNN}>RNN</MenuItem>
                    <MenuItem value={ModelPredict.LINEAR}>Linear</MenuItem>
                </Select>
            </FormControl>
            <div
                className={
                    "mt-4 flex gap-2 justify-center w-full mx-auto flex-wrap"
                }
            >
                {Object.keys(serieState).map((item, index) => (
                    <div key={index}>
                        <Chart
                            options={{
                                ...options,
                                title: {
                                    text: chartTitle[item as keyof Sensor],
                                    align: "center",
                                },
                            }}
                            series={serieState[item as keyof Sensor]}
                            height={"450"}
                            width={"500"}
                        />
                        {chartLoading.includes(item as keyof Sensor) && (
                            <LinearProgress />
                        )}
                    </div>
                ))}
            </div>
            {!!current && (
                <div>
                    <div className={"flex"}>
                        <IonTitle
                            className={
                                "font-bold text-gray-600 text-xl basis-1"
                            }
                        >
                            Average measured value{" "}
                        </IonTitle>
                        <FormControl>
                            <InputLabel id="demo-simple-select-label">
                                Model
                            </InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={modelType}
                                onChange={(e) =>
                                    setModelType(e.target.value as ModelPredict)
                                }
                            >
                                <MenuItem value={ModelPredict.RNN}>
                                    RNN
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <IonGrid>
                        <IonRow className={"justify-center"}>
                            <IonCol size={"4"}>
                                <IonRow className={"text-xl text-blue-600"}>
                                    Current
                                </IonRow>
                                <IonRow>
                                    <IonCol>Light</IonCol>
                                    <IonCol>{current?.data?.light}</IonCol>
                                </IonRow>
                                <IonRow>
                                    <IonCol>Temperature</IonCol>
                                    <IonCol>
                                        {current?.data?.temperature}
                                    </IonCol>
                                </IonRow>
                                <IonRow>
                                    <IonCol>Soil</IonCol>
                                    <IonCol>{current?.data?.soil}</IonCol>
                                </IonRow>
                            </IonCol>
                            <IonCol size={4}>
                                <IonRow className={"text-xl text-yellow-600"}>
                                    Predicted
                                </IonRow>
                                <IonRow>
                                    <IonCol>Light</IonCol>
                                    <IonCol>{current?.predicted?.light}</IonCol>
                                </IonRow>
                                <IonRow>
                                    <IonCol>Temperature</IonCol>
                                    <IonCol>
                                        {current?.predicted?.temperature}
                                    </IonCol>
                                </IonRow>
                                <IonRow>
                                    <IonCol>Soil</IonCol>
                                    <IonCol>{current?.predicted?.soil}</IonCol>
                                </IonRow>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </div>
            )}
        </div>
    );
};
