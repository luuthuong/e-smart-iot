import { Box, Button, Checkbox, TextField } from "@mui/material";
import { useState } from "react";
import { Device, Sensor } from "../../shared";
import { Range, DateRangePicker } from "react-date-range";
import { Timestamp, doc, setDoc } from "firebase/firestore";
import { rand } from "@tensorflow/tfjs";
import { DeviceHistory, firestore, SensorHistory } from "../../database";
import { PredictFn } from "../PredictVisualization/predictions/prediction.type";
import { LinearRegressionV2 } from "../PredictVisualization/predictions/linear-regression-v2";
import { ModelPredict } from "../PredictVisualization/predictions/prediction-factory";
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

                await setDoc(doc(firestore, "History-Device", createGuid()), {
                    light: Math.random() < 0.1,
                    fan: Math.random() < 0.5,
                    motor: Math.random() < 0.4,
                    pump: Math.random() < 0.6,
                    time: Timestamp.fromDate(startDate),
                } as DeviceHistory);
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
                <Button>Submit</Button>
            </Box>
        </div>
    );
};

export const PredictFactory: {
    [x in ModelPredict]: PredictFn
} = {
    [ModelPredict.LINEAR]: async (data) =>{
        await new Promise(resolve => setTimeout(resolve, 8000));
        return await LinearRegressionV2(data);
    },
    [ModelPredict.RNN]: LinearRegressionV2,
    [ModelPredict.NONE]: async (data) => {
        return new Promise<number[]>(() => {});
    },
};