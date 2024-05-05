import * as tf from "@tensorflow/tfjs";
import { PredictFn, PredictionFn, normalize } from "./prediction.type";
import { Sensor } from "../../../shared";

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
export const recurrentNeutralNetwork: PredictionFn = async (
    _sensorData: Sensor[]
): Promise<number[][]> => {
    const convertToTensor3D = (data: Sensor[]) => {
        const tensor3D = tf.tensor3d(
            [
                data.map(({ light, soil, temperature }) => [
                    light,
                    soil,
                    temperature,
                ]),
            ],
            [1, data.length, 3] // [batch_size, time_steps, features]
        );
        return tensor3D;
    };
    const inputTensor = convertToTensor3D(_sensorData);

    // Create and compile the model
    const model = tf.sequential();
    model.add(
        tf.layers.simpleRNN({
            units: 10, // Number of units in the RNN layer
            inputShape: [_sensorData.length, 3], // Input shape: [time_steps, features]
            returnSequences: false, // Return only the final output
        })
    );
    model.add(tf.layers.flatten());
    model.add(
        tf.layers.dense({
            units: 3, // Output layer with 3 units (light, soil, temperature)
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
        const history = await model.fit(inputTensor, inputTensor, {
            epochs: 100,
            batchSize: 1,
        });
        console.log("Model training complete");
        return history;
    };

    await trainModel().then(async () => {
        // Predict the next 7 days
        const predictions = [];
        let currentData = inputTensor;

        for (let i = 0; i < 7; i++) {
            const prediction = model.predict(currentData);
            predictions.push(prediction);
            currentData = prediction;
        }

        console.log("Predictions for the next 7 days:", predictions);
    });
    return [];
};
