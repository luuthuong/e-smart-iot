import * as tf from "@tensorflow/tfjs";
import { CustomCallbackArgs, Logs } from "@tensorflow/tfjs";
import { PredictFn, normalize } from "./prediction.type";

export const LinearRegressionV2: PredictFn = async (inputData: number[][]) => {
    // Output data (labels)
    const outputData = inputData.map((x) => [x[0]]);

    // Convert input and output data to tensors
    const inputTensor = tf.tensor2d(inputData);
    const outputTensor = tf.tensor2d(outputData);

    const {
        normalizedData: normalizedInput,
        min: inputMin,
        max: inputMax,
    } = normalize(inputTensor);

    const {
        normalizedData: normalizedOutput,
        min: outputMin,
        max: outputMax,
    } = normalize(outputTensor);

    // Define the model
    const model = tf.sequential();
    model.add(
        tf.layers.dense({ units: 64, inputShape: [24], activation: "relu" })
    );
    model.add(tf.layers.dense({ units: 1 }));

    // Compile the model
    model.compile({
        optimizer: "adam",
        loss: "meanSquaredError",
        metrics: ["accuracy"],
    });

    // Train the model
    async function trainModel() {
        const history = await model.fit(normalizedInput, normalizedOutput, {
            epochs: 100,
            verbose: 1,
            callbacks: {
                onBatchEnd(batch, logs: tf.Logs) {
                    console.log(logs.acc);
                },
            } as CustomCallbackArgs,
        });
    }

    // Predict
    function onPredict(data: number[][]) {
        const normalizedData = tf
            .tensor2d(data)
            .sub(inputMin)
            .div(inputMax.sub(inputMin));
        const prediction = model.predict(normalizedData) as tf.Tensor<tf.Rank>;
        const denormalizedPrediction = prediction
            .mul(outputMax.sub(outputMin))
            .add(outputMin);
        return denormalizedPrediction.dataSync();
    }

    // Train the model and make predictions
    return trainModel().then(() => {
        const result: number[] = [];
        inputData.slice(inputData.length - 7).forEach((data, index) => {
            const prediction = onPredict([data]);
            result.push(+(+prediction).toFixed(2));
        });
        console.log("predict result", result);
        return result;
    });
};
