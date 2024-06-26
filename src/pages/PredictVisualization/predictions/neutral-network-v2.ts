import * as tf from "@tensorflow/tfjs";
import { Data1D, Data2D, Data3D, PredictFn, PredictionFn, normalize } from "./prediction.type";
import { Sensor } from "../../../shared";
import { CustomCallbackArgs } from "@tensorflow/tfjs";

const normalizedData = (items: Sensor[]): Sensor[] => {
    const { max, min } = items.reduce(
        (acc, { light, soil, temperature }) => {
            const { min, max } = Math;
            acc.min.light = min(acc.min.light, light);
            acc.min.soil = min(acc.min.soil, soil);
            acc.min.temperature = min(acc.min.temperature, temperature);
            acc.max.light = max(acc.max.light, light);
            acc.max.soil = max(acc.max.soil, soil);
            acc.max.temperature = max(acc.max.temperature, temperature);
            return acc;
        },
        {
            min: { light: Infinity, soil: Infinity, temperature: Infinity },
            max: {
                light: -Infinity,
                soil: -Infinity,
                temperature: -Infinity,
            },
        }
    );
    const calc = (val: number, min: number, max: number) =>
        (val - min) / (max - min);
    return items.map(({ light, soil, temperature }) => ({
        light: calc(light, min.light, max.light),
        soil: calc(soil, min.soil, max.soil),
        temperature: calc(temperature, min.temperature, max.temperature),
    }));
};

/*
    [
        [
            [200, 202, 214, 206, 250, 250], 
            [50, 52, 48, 33, 22, 56], 
            [32, 33, 33, 33, 34, 28]
        ],
        [
            [232, 252, 222, 222, 250, 250], 
            [51, 51, 55, 57, 23, 56], 
            [32, 33, 33, 33, 34, 28]
        ],
        ...
    ]
*/
export const recurrentNeutralNetwork: PredictFn = async (
    sensorData: Data2D<number> | Data3D<number>
) => {
    const _sensorData = sensorData as Data3D<number>;
    const output3D = _sensorData.map((x) => [x[0], x[1], x[2]]); 

    const inputTensor = tf.tensor3d(
        _sensorData,
        [1, _sensorData.length, 3] // [batch_size, time_steps, features]
    );

    const outputTensor = tf.tensor3d(
        output3D,
        [1, _sensorData.length, 3] // [batch_size, time_steps, features]
    );

    const {
        min: inputMin,
        max: inputMax,
    } = normalize(inputTensor);

    const {
        min: outputMin,
        max: outputMax,
    } = normalize(outputTensor);

    const model = tf.sequential();
    model.add(
        tf.layers.simpleRNN({
            units: 10,
            inputShape: [_sensorData.length, 3],
            returnSequences: false,
        })
    );
    model.add(
        tf.layers.dense({
            units: 3,
            activation: "linear",
        })
    );

    // Compile the model
    model.compile({
        optimizer: "adam",
        loss: "meanSquaredError",
    });

    // Train the model
    const trainModel = async () => {
        await model.fit(inputTensor, inputTensor, {
            epochs: 100,
            verbose: 1,
            callbacks: {
                onBatchEnd(batch, logs: tf.Logs) {
                    console.log(logs);
                },
            } as CustomCallbackArgs,
        });
    };

    return await trainModel().then(async () => {

        const onPredict = async (data: any[]) => {
            const normalizedNextWeekDays = tf
                .tensor3d(data.map((item) => [item]))
                .sub(inputMin)
                .div(inputMax.sub(inputMin))
                .reshape([data.length, 1, 1]);

            const predictions = model.predict(
                normalizedNextWeekDays
            ) as tf.Tensor<tf.Rank>;

            // Reshape predictions and denormalize
            const reshapedPredictions = predictions.reshape([
                nextData.length,
                1,
            ]);

            const denormalizedPredictions = reshapedPredictions
                .mul(outputMax.sub(outputMin))
                .add(outputMin);
            return [
                ...(
                    await denormalizedPredictions.dataSync()
                )
            ] as Data1D<number>;
        };

        const result: Data2D<number> = [];
        const nextData = _sensorData.slice(_sensorData.length - 7);

        nextData.forEach(async (data) => {
            const prediction = await onPredict(data);
            result.push(prediction).toFixed(2);
        });

        return result;
    });
};
