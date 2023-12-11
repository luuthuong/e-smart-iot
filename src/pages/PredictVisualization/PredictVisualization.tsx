import React, {useEffect, useState} from 'react'
import {
    IonButton,
    IonButtons,
    IonCol,
    IonGrid,
    IonIcon,
    IonItemDivider,
    IonRouterLink,
    IonRow,
    IonTitle
} from "@ionic/react";
import {homeOutline, refreshOutline} from "ionicons/icons";
import * as tf from "@tensorflow/tfjs";
import Chart, {Props} from "react-apexcharts";
import {collection, getDocs, limit, orderBy, query, Timestamp} from "firebase/firestore";
import {firestore} from "../../database";
import {HISTORY_SENSOR} from "../../shared/constant";


export const PredictVisualization = () => {
    const generateTimestampsForTomorrow = (length = 24) => {
        const timestamps = [];
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1); // Increment by 1 day for tomorrow

        // Set tomorrow's date to 00:00:00 to start from the beginning of the day
        tomorrow.setHours(0, 0, 0, 0);

        // Generate timestamps at regular intervals throughout the day (every hour, for example)
        for (let i = 0; i < length; i++) {
            const timestamp = new Date(tomorrow);
            timestamp.setHours(i, 0, 0, 0); // Set the hour of the day
            timestamps.push(timestamp.getTime()); // Push timestamp in milliseconds
        }

        return timestamps;
    }

    const [state, setState] = useState(
        {
            options: {
                chart: {
                    id: "basic-bar"
                }
            },
            series: []
        } as Props
    )

    const [current, setCurrent] = useState<any>(undefined);

    const calculateAverage = (numbers: number[]): string => {
        if (numbers.length === 0) {
            return 0;
        }

        const sum = numbers.reduce((acc, currentValue) => acc + currentValue, 0);
        return (sum / numbers.length).toFixed(2);
    }


    const onPredict = (resolve: (result: any) => any) => {
        const deviceRef = collection(firestore, HISTORY_SENSOR);
        const queryCollection = [
            orderBy(
                "time",
                "desc"
            ),
            limit(50)
        ]
        const snapshot = getDocs(query(deviceRef, ...queryCollection));
        snapshot.then(res => {
            const data = res.docs.map(x => ({
                ...x.data(),
                id: x.id,
                time: (x.data().time as Timestamp).toMillis()
            }))
            const result = [];
            const total = data.length;
            let step = Math.floor(total / 23);
            if (step == 0)
                step = 1;

            for (let i = 0; i < 24; i++) {
                if (i === 0) {
                    result.push(data[i]);
                    continue;
                }

                const index = i + step;
                if (index > total) {
                    result.push(data[total - 1]);
                    return;
                }

                result.push(data[index]);
            }
            // Template for sensor data of tomorrow
            const tomorrowTemplate = {
                "time": 1701782970226, // Replace with tomorrow's timestamp
                "soil": 97,
                "rain": false,
                "light": 0,
                "temperature": 0,
                "id": "e72cf36f-f9c5-4dee-b11a-951c0e3dc638"
            };

            try {
                // Preprocess the data - convert object properties into numerical data
                const processedTodayData = data.map(item => [
                    item.time, // Time
                    item.light,
                    item.soil,
                    item.temperature,
                ]);

                // Extract input features (excluding target features)
                const inputFeatures = processedTodayData.map(item => [
                    item[0], // Time
                    item[1], // Light
                    item[2], // Soil
                    item[3], // Temperature
                ]);

                // Extract output features (temperature, light, soil)
                const outputFeatures = processedTodayData.map(item => [
                    item[3], // Temperature
                    item[1], // Light
                    item[2], // Soil
                ]);

                // Convert extracted features into tensors with explicit shape
                const inputTensor = tf.tensor2d(inputFeatures, [inputFeatures.length, inputFeatures[0].length]);
                const outputTensor = tf.tensor2d(outputFeatures, [outputFeatures.length, outputFeatures[0].length]);

                // Normalize data (you may need to adjust this based on your data)
                const inputMax = inputTensor.max();
                const inputMin = inputTensor.min();
                const outputMax = outputTensor.max();
                const outputMin = outputTensor.min();

                const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
                const normalizedOutputs = outputTensor.sub(outputMin).div(outputMax.sub(outputMin));

                // Create and train the model (simplified for demonstration)
                const model = tf.sequential();
                model.add(tf.layers.dense({units: 3, inputShape: [inputFeatures[0].length]}));
                model.compile({
                    optimizer: 'sgd',
                    loss: 'meanSquaredError',
                    metrics: ['mse'],
                });

                // Train the model (you may need more epochs and proper data splitting for training)
                model.fit(normalizedInputs, normalizedOutputs, {epochs: 100});
                // Prepare input data for prediction (using tomorrow's template)
                const timestampsOfTomorrow = generateTimestampsForTomorrow(result.length);
                const predicted = timestampsOfTomorrow.map(timestamp => {
                    const inputForTomorrow = [
                        timestamp,
                        tomorrowTemplate.light,
                        tomorrowTemplate.soil,
                        tomorrowTemplate.temperature
                    ];
                    const inputTensorForTomorrow = tf.tensor2d([inputForTomorrow], [1, inputForTomorrow.length]);
                    const normalizedInputForTomorrow = inputTensorForTomorrow.sub(inputMin).div(inputMax.sub(inputMin));

                    const predictedOutputForTomorrow = model.predict(normalizedInputForTomorrow);
                    const predicted = predictedOutputForTomorrow.mul(outputMax.sub(outputMin)).add(outputMin).arraySync();

                    const [light, soil, temperature] = predicted[0].map((value: any, index: number) => {
                            if (index === 2) { // Temperature index
                                return value < 0 ? 0 : Math.min(value, 32);
                            }
                            return value < 0 ? 0 : value
                        }
                    );

                    return {timestamp, light, soil, temperature};
                });
                resolve({
                    data: result,
                    predicted
                });
            } catch (error) {
                console.error('Error:', error);
            }

        })
    }

    const predictHandler = () => {
        onPredict(response => {

            setCurrent({
                data: {
                    light: calculateAverage(response.data.map((x: any) => x.light)),
                    temperature: calculateAverage(response.data.map((x: any) => x.temperature)),
                    soil: calculateAverage(response.data.map((x: any) => x.temperature))
                },
                predicted:{
                    light: calculateAverage(response.predicted.map((x: any) => x.light)),
                    temperature: calculateAverage(response.predicted.map((x: any) => x.temperature)),
                    soil: calculateAverage(response.predicted.map((x: any) => x.soil))
                }
            })

            setState(prev => ({
                ...prev,
                options:
                    {
                        chart: {
                            id: "basic-bar"
                        },
                        xaxis: {
                            categories: generateTimestampsForTomorrow(response.predicted?.length).map(timestamp => {
                                const date = new Date(timestamp);
                                return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false});
                            })
                        }
                    }
                ,
                series: [
                    {
                        name: "Light",
                        data: response.data.map((x: any) => x.light)
                    },
                    {
                        name: "Light predict",
                        data: response.predicted.map((x: any) => x.light)
                    },
                    {
                        name: "Soil",
                        data: response.data.map((x: any) => x.soil)
                    },
                    {
                        name: "Soil predict",
                        data: response.predicted.map((x: any) => x.soil)
                    },
                    {
                        name: "Temperature",
                        data: response.data.map((x: any) => x.temperature)
                    },
                    {
                        name: "Temperature predict",
                        data: response.predicted.map((x: any) => x.temperature)
                    }
                ]
            } as Props))
        });
    }

    useEffect(() => {
        predictHandler();
    }, []);


    return <div className={'px-4'}>
        <div className={'mt-2 flex  justify-end mr-2 items-center'}>
            <IonTitle className={'font-bold text-gray-600 text-2xl'}>Predict Visualization For Tomorrow</IonTitle>
            <IonButtons>
                <IonButton color={'light'} fill={'solid'} onClick={predictHandler}>
                    <IonIcon slot={'start'} icon={refreshOutline}/>
                    <span>Refresh</span>
                </IonButton>
                <IonRouterLink routerLink={'/system'}>
                    <IonButton color={'light'} fill={'solid'}>
                        <IonIcon slot={'start'} icon={homeOutline}/>
                        <span>Go to home</span>
                    </IonButton>
                </IonRouterLink>
            </IonButtons>
        </div>

        <div className={'mt-4  w-full mx-auto flex-wrap'}>
            {
                state && <Chart
                    options={state.options}
                    series={state.series}
                    type="line"
                    height={'450'}
                />
            }
        </div>

        {
            !!current &&  <div>
                <IonTitle className={'font-bold text-gray-600 text-xl'}>Average measured value </IonTitle>
                <IonGrid>
                    <IonRow className={'justify-center'}>
                        <IonCol size={4}>
                            <IonRow className={'text-xl text-blue-600'}>Current</IonRow>
                            <IonRow>
                                <IonCol >Light</IonCol>
                                <IonCol>{current?.data?.light}</IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol>Temperature</IonCol>
                                <IonCol>{current?.data?.temperature}</IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol>Soil</IonCol>
                                <IonCol>{current?.data?.soil}</IonCol>
                            </IonRow>
                        </IonCol>
                        <IonCol size={4}>
                            <IonRow className={'text-xl text-yellow-600'}>Predicted</IonRow>
                            <IonRow>
                                <IonCol >Light</IonCol>
                                <IonCol>{current?.predicted?.light}</IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol>Temperature</IonCol>
                                <IonCol>{current?.predicted?.temperature}</IonCol>
                            </IonRow>
                            <IonRow>
                                <IonCol>Soil</IonCol>
                                <IonCol>{current?.predicted?.soil}</IonCol>
                            </IonRow>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </div>
        }
    </div>
}