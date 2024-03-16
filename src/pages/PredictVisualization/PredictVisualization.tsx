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
    addDoc,
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    Timestamp,
} from "firebase/firestore";
import { PredictHistory, firestore } from "../../database";
import { HISTORY_SENSOR, PREDICT_HISTORY } from "../../shared/constant";
import {
    FormControl,
    InputLabel,
    LinearProgress,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
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

    function createData(
        name: string,
        calories: number,
        fat: number,
        carbs: number
    ) {
        return { name, calories, fat, carbs };
    }

    const rows = [
        createData("Temperature", 159, 6.0, 24),
        createData("Soil", 237, 9.0, 37),
        createData("Light", 262, 16.0, 24),
    ];

    const [predicted, setPredicted] = useState<PredictHistory | undefined>(
        undefined
    );
    useEffect(() => {
        const _ref = collection(firestore, PREDICT_HISTORY);
        getDocs(query(_ref, orderBy("time"), limit(1))).then((res) => {
            const result = res.docs.map(
                (item) =>
                    ({
                        ...item.data(),
                        time: item.data().time.toDate(),
                    } as PredictHistory)
            );
            if (!result?.length) return;

            setSerieState((curr) => ({
                ...curr,
                light: [
                    {
                        data: result[0].light.map(Math.round),
                    },
                ],
                soil: [
                    {
                        data: result[0].soil.map(Math.round),
                    },
                ],
                temperature: [
                    {
                        data: result[0].temperature.map(Math.round),
                    },
                ],
            }));

            setPredicted(result[0] as PredictHistory);
        });
    }, []);

    useEffect(() => {
        if (modelType === ModelPredict.NONE) return;
        const keys: (keyof Sensor)[] = ["light", "soil", "temperature"];
        const loading = new Set(keys);
        if (chartLoading.length != 0) return;
        setChartLoading(keys);
        getData().then(async (result) => {
            Promise.all(
                keys.map((key) =>
                    PredictFactory[modelType](result.map((x) => x[key]))
                )
            )
                .then((responses) => {
                    responses.forEach((res, index) => {
                        const predict = res.map(Math.round);
                        setSerieState((curr) => ({
                            ...curr,
                            [keys[index]]: [
                                {
                                    data: [...predict] as number[],
                                },
                            ] as ApexAxisChartSeries,
                        }));
                        loading.delete(keys[index]);
                        setChartLoading([...loading]);
                    });

                    const _keys: (keyof Omit<
                        PredictHistory,
                        "time" | "timeRange"
                    >)[] = ["light", "soil", "temperature"];
                    return responses.reduce(
                        (prev: PredictHistory, cur, index) => {
                            prev[_keys[index]] = [...cur] as number[];
                            return prev;
                        },
                        {} as PredictHistory
                    );
                })
                .then((data) => {
                    data.time = Timestamp.fromDate(new Date());
                    data.timeRange = getNext7Days();
                    return Promise.all([
                        data,
                        addDoc(collection(firestore, PREDICT_HISTORY), data),
                    ]);
                })
                .then((res) => {
                    setPredicted(res[0]);
                    console.log("saved predict", res[1].id);
                })
                .catch((e) => {
                    console.log("error when saved data", e);
                });
        });
    }, [modelType]);

    return (
        <div className={"px-4 w-full"}>
            <div className={"mt-2 flex  justify-end mr-2 items-center"}>
                <IonTitle className={"font-bold text-gray-600 text-2xl"}>
                    Predict visualization for next week
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
            <FormControl disabled={chartLoading.length != 0} className="my-2">
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
            <h1 className="text-gray-600 text-2xl font-bold">Last predict</h1>
            {predicted && (
                <TableContainer className="mb-10" component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Sensors</TableCell>
                                {(predicted?.timeRange || getNext7Days()).map(
                                    (item, index) => (
                                        <TableCell key={index} align="right">
                                            {item}
                                        </TableCell>
                                    )
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.keys(predicted)
                                .filter(
                                    (x) => !["time", "timeRange"].includes(x)
                                )
                                .map((key, index) => (
                                    <TableRow
                                        key={index}
                                        sx={{
                                            "&:last-child td, &:last-child th":
                                                {
                                                    border: 0,
                                                },
                                        }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {key.toUpperCase()}
                                        </TableCell>
                                        {(predicted[key] as number[]).map(
                                            (item, i) => (
                                                <TableCell
                                                    key={i}
                                                    component="th"
                                                    scope="row"
                                                    style={{
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {Math.round(item)}
                                                </TableCell>
                                            )
                                        )}
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </div>
    );
};
