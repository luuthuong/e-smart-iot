import { Box, Button, Checkbox, TextField } from "@mui/material";
import { useState } from "react";
import { Device, Sensor } from "../../shared";
import { Range, DateRangePicker } from "react-date-range";
import { PredictFn } from "../PredictVisualization/predictions/prediction.type";
import { LinearRegressionV2 } from "../PredictVisualization/predictions/linear-regression-v2";
import { ModelPredict } from "../PredictVisualization/predictions/prediction-factory";
import * as tf from "@tensorflow/tfjs";

const randomIndex = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const createGuid = (): string => {
    let d = new Date().getTime();
    const guid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        (c) => {
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        }
    );
    return guid;
};

export const PageData = () => {
    const [range, setRange] = useState<Range>({
        startDate: new Date(),
        endDate: new Date(),
        key: "selection",
    });

    const [sensor, setSensor] = useState<Sensor>({
        light: 356,
        soil: 45,
        temperature: 31,
    });

    const [device, setDevice] = useState<Device>({
        lamp: false,
        motor: false,
        pump: false,
    });

    const keys: (keyof Sensor)[] = ["light", "soil", "temperature"];

    const deviceKeys: (keyof Device)[] = ["lamp", "motor", "pump"];

    const onSubmit = async () => {
        const { startDate, endDate } = range;
        while (startDate && endDate && startDate <= endDate) {
            for (let i = 0; i < 24; i++) {
                startDate.setHours(i);
                // const temperatures = [30, 34, 31, 33, 32];
                // const soil = [45, 50, 60, 67, 53];
                // const light = [300, 325, 462, 420, 421];
                // await setDoc(doc(
                //     firestore,
                //     "History-Sensor",
                //     createGuid()
                // ),
                // {
                //     light: randomIndex(light),
                //     rain: false,
                //     soil: randomIndex(soil),
                //     temperature: randomIndex(temperatures),
                //     time: Timestamp.fromDate(startDate)
                // } as SensorHistory);

                // await setDoc(doc(firestore, "History-Device", createGuid()), {
                //     light: Math.random() < 0.1,
                //     fan: Math.random() < 0.5,
                //     motor: Math.random() < 0.4,
                //     pump: Math.random() < 0.6,
                //     time: Timestamp.fromDate(startDate),
                // } as DeviceHistory);
            }
            startDate.setDate(startDate.getDate() + 1);
        }
    };

    return (
        <div style={{ width: "100%" }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "12px",
                }}
            >
                {keys.map((key) => (
                    <TextField
                        key={key}
                        label={key.toUpperCase()}
                        type="number"
                        id="outlined-start-adornment"
                        sx={{ m: 1, width: "25ch" }}
                        value={sensor[key]}
                        onChange={($event) => {
                            setSensor((current) => ({
                                ...current,
                                [key]: Number($event.target.value),
                            }));
                        }}
                    />
                ))}
            </Box>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "12px",
                }}
            >
                {deviceKeys.map((key) => (
                    <Checkbox
                        key={key}
                        value={device[key]}
                        onChange={($event) => {
                            setDevice((current) => ({
                                ...current,
                                [key]: $event.target.value,
                            }));
                        }}
                    />
                ))}
            </Box>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginTop: "12px",
                }}
            >
                <DateRangePicker
                    ranges={[range]}
                    onChange={($event) => {
                        setRange($event["selection"]);
                    }}
                />
                <Button onClick={onSubmit}>Submit</Button>
            </Box>
        </div>
    );
};

export let __value__ = 0;

export const PredictFactory: {
    [x in ModelPredict]: PredictFn;
} = {
    [ModelPredict.LINEAR]: async (data) => {
        __value__ = 0;
        await LinearRegressionV2(data);
        await LinearRegressionV2(data);
        return await LinearRegressionV2(data).then(res =>{
            return res;
        });
    },
    [ModelPredict.RNN]: async (data) => {
        __value__ = 0.5;
        // await demo();
        return await LinearRegressionV2(data).then(r =>{
            return r;
        });
    },
    [ModelPredict.NONE]: async (data) => {
        return new Promise<number[]>(() => {});
    },
};

const demo = async () => {
    // Generate some synthetic data for training

    const generateData = () => {
        const x = [];
        const y = [];
        for (let i = 0; i < 100; i++) {
            x.push([[Math.sin(i)]]);
            y.push([Math.sin(i + 1)]);
        }
        return {
            x: tf.tensor3d(x, [100, 1, 1]),
            y: tf.tensor2d(y, [100, 1])
        };
    };


    // Create the model
    const createModel = () => {
        const model = tf.sequential();
        model.add(
            tf.layers.simpleRNN({
                units: 10,
                inputShape: [1, 1],
                activation: "tanh",
            })
        );
        model.add(
            tf.layers.dense({
                units: 1,
                activation: "linear",
            })
        );
        model.compile({
            optimizer: "adam",
            loss: "meanSquaredError",
            metrics: ["accuracy"],
        });
        return model;
    };

    // Train the model
    const trainModel = async (model, xTrain, yTrain) => {
        const history = await model.fit(xTrain, yTrain, {
            epochs: 50,
            batchSize: 1,
            validationSplit: 0.2,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    console.log(logs);
                },
            },
        });
        return history;
    };

    // Predict using the model
    const predict = (model, input) => {
        const inputTensor = tf.tensor3d([input], [1, 1, 1]);
        const prediction = model.predict(inputTensor);
        prediction.print();
    };

    // Main function
    await (async () => {
        const data = generateData();
        const model = createModel();
        await trainModel(model, data.x, data.y);
        predict(model, [Math.sin(101)]);
    })();
};

