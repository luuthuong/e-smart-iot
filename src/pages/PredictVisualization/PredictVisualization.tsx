import { useEffect, useState } from "react";
import {
    IonButton,
    IonButtons,
    IonIcon,
    IonRouterLink,
    IonTitle,
} from "@ionic/react";
import { homeOutline, refreshOutline } from "ionicons/icons";
import Chart from "react-apexcharts";
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
import {
    HISTORY_SENSOR,
    PREDICT_HISTORY,
    PREDICT_SOIL_ON_LIGHT_TEMPERATURE,
} from "../../shared/constant";
import {
    LinearProgress,
    Paper,
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
import { onPredictSoil } from "./PredictionSoil";

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

    const [data, setData] = useState<(Sensor & { time: Date })[]>([]);
    const [predictedSoil, setPredictedSoil] = useState<string[]>([]);

    const setLoadingPredictSoil = () => {
        setPredictedSoil(new Array(7).fill("Loading..."));
    };

    const chartTitle: Record<keyof Sensor, string> = {
        light: "Predict light",
        soil: "Predict soil",
        temperature: "Predict temperature",
    };

    const [chartLoading, setChartLoading] = useState<(keyof Sensor)[]>([]);

    const [modelType, setModelType] = useState<ModelPredict>(ModelPredict.NONE);
    let sensorData: Sensor[] = [];

    const getData = () => {
        const sensorRef = collection(firestore, HISTORY_SENSOR);
        const queryCollection = [orderBy("time", "desc"), limit(1000)];
        return getDocs(query(sensorRef, ...queryCollection))
            .then((res) => {
                return (sensorData = res.docs.map(
                    (x) =>
                        ({
                            ...x.data(),
                            time: (x.data().time as Timestamp).toDate(),
                        } as Sensor & { time: Date })
                ));
            })
            .then((res) => {
                setData(res);
                return res;
            });
    };

    const [predicted, setPredicted] = useState<PredictHistory | undefined>(
        undefined
    );
    useEffect(() => {
        setLoadingPredictSoil();
        const _ref = collection(firestore, PREDICT_HISTORY);
        getDocs(query(_ref, orderBy("time", "desc"), limit(1))).then((res) => {
            const result = res.docs.map(
                (item) =>
                    ({
                        ...item.data(),
                        time: item.data().time,
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

        getDocs(
            query(
                collection(firestore, PREDICT_SOIL_ON_LIGHT_TEMPERATURE),
                orderBy("time", "desc"),
                limit(1)
            )
        ).then((res) => {
            const result = res.docs.map(
                (item) =>
                    ({
                        ...item.data(),
                        time: item.data().time,
                    } as {
                        data: string[];
                        time: Timestamp;
                    })
            )[0];
            setPredictedSoil(result.data);
        });
    }, []);

    const onPredict = () => {
        if (modelType === ModelPredict.NONE) return;
        const keys: (keyof Sensor)[] = ["light", "soil", "temperature"];
        const loading = new Set(keys);
        if (chartLoading.length != 0) return;
        setChartLoading(keys);
        let currentData: (Sensor & {
            time: Date;
        })[] = [];
        getData()
            .then(async (result) => {
                currentData = result;
                const fmDate = (date: Date) =>
                    moment(date).format("DD-MM-yyyy");
                const daySet = new Set<string>(
                    result.map((item) => fmDate(item.time))
                );

                const days = [...daySet];

                const dataInputPredict: Sensor[][] = [];
                days.forEach((day) => {
                    let data = result.filter((x) => fmDate(x.time) === day);
                    while (data.length < 24) {
                        data.push(data[0]);
                    }
                    if (data.length > 24)
                        data.splice(data.length, 24 - data.length);
                    dataInputPredict.push(
                        data.map((x) => ({
                            light: x.light,
                            soil: x.soil,
                            temperature: x.temperature,
                        })) as Sensor[]
                    );
                });
                const getInput = (key: keyof Sensor) => {
                    return dataInputPredict.map((items) =>
                        items.map((x) => x[key])
                    );
                };

                Promise.all(
                    keys.map((key) => PredictFactory[modelType](getInput(key)))
                )
                    .then((responses) => {
                        responses.forEach((res, index) => {
                            if (!res.length) return;

                            const predict = res;
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
                            setLoadingPredictSoil();
                        });

                        return responses.reduce(
                            (prev: PredictHistory, cur, index) => {
                                prev[keys[index]] = [...cur] as number[];
                                return prev;
                            },
                            {} as PredictHistory
                        );
                    })
                    .then(async (data) => {
                        data.time = Timestamp.fromDate(new Date());
                        data.timeRange = getNext7Days();

                        const predictedSoil = await onPredictSoil(
                            currentData,
                            data.temperature.reduce<number[][]>(
                                (acc, value, index) => {
                                    acc.push([value, data.light[index]]);
                                    return acc;
                                },
                                []
                            )
                        );
                        setPredictedSoil(
                            predictedSoil.map((item) => item.toString())
                        );
                        await addDoc(
                            collection(
                                firestore,
                                PREDICT_SOIL_ON_LIGHT_TEMPERATURE
                            ),
                            {
                                time: data.time,
                                data: predictedSoil,
                            }
                        );

                        await Promise.all([
                            data,
                            addDoc(
                                collection(firestore, PREDICT_HISTORY),
                                data
                            ),
                        ]);
                    })
                    .catch((e) => {
                        console.log("error when saved data", e);
                    });
            })
            .finally(() => {});
    };

    useEffect(() => {
        onPredict();
    }, [modelType]);

    const isActiveModel = (type: ModelPredict) => modelType === type;

    return (
        <div className={"px-4 w-full"}>
            <div className={"mt-2 flex  justify-end mr-2 items-center"}>
                <IonTitle className={"font-bold text-gray-600 text-2xl"}>
                    Predict visualization
                </IonTitle>
                <IonButtons>
                    <IonButton
                        disabled={chartLoading.length != 0}
                        onClick={() => setModelType(() => ModelPredict.LINEAR)}
                        color={
                            isActiveModel(ModelPredict.LINEAR)
                                ? "dark"
                                : "light"
                        }
                        fill={
                            !isActiveModel(ModelPredict.LINEAR)
                                ? "solid"
                                : "outline"
                        }
                    >
                        <span className="text-gray-700">Linear</span>
                    </IonButton>
                    <IonButton
                        disabled={chartLoading.length != 0}
                        onClick={() => setModelType(() => ModelPredict.RNN)}
                        color={
                            isActiveModel(ModelPredict.RNN) ? "dark" : "light"
                        }
                        fill={
                            !isActiveModel(ModelPredict.RNN)
                                ? "solid"
                                : "outline"
                        }
                    >
                        <span className="text-gray-700">RNN</span>
                    </IonButton>
                    {modelType ? (
                        <IonButton
                            disabled={!!chartLoading.length}
                            onClick={onPredict}
                            color={"light"}
                            fill={"solid"}
                        >
                            <IonIcon slot={"start"} icon={refreshOutline} />
                            <span>Refresh</span>
                        </IonButton>
                    ) : (
                        <></>
                    )}

                    <IonRouterLink routerLink={"/system"}>
                        <IonButton color={"light"} fill={"solid"}>
                            <IonIcon slot={"start"} icon={homeOutline} />
                            <span>Go to home</span>
                        </IonButton>
                    </IonRouterLink>
                </IonButtons>
            </div>
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

            {predicted && (
                <>
                    <div className="flex gap-4 items-center">
                        <h1 className="text-gray-600 text-2xl font-bold">
                            Last predict
                        </h1>
                        <span>
                            {moment(predicted.time.toDate()).format(
                                "DD-MM-yyyy HH:mm:ss"
                            )}
                        </span>
                    </div>
                    <TableContainer className="mb-10" component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Sensors</TableCell>
                                    {(
                                        predicted?.timeRange || getNext7Days()
                                    ).map((item, index) => (
                                        <TableCell key={index} align="right">
                                            {item}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.keys(predicted)
                                    .filter(
                                        (x) =>
                                            !["time", "timeRange"].includes(x)
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
                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
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
                                                        {item}
                                                    </TableCell>
                                                )
                                            )}
                                        </TableRow>
                                    ))}
                                {predictedSoil && (
                                    <TableRow
                                        sx={{
                                            "&:last-child td, &:last-child th":
                                                {
                                                    border: 0,
                                                },
                                        }}
                                    >
                                        <TableCell component="th" scope="row">
                                            SOIL ON TEMPERATURE AND LIGHT
                                        </TableCell>
                                        {predictedSoil.map((item, i) => (
                                            <TableCell
                                                key={i}
                                                component="th"
                                                scope="row"
                                                style={{
                                                    textAlign: "center",
                                                }}
                                            >
                                                {item}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </div>
    );
};
