import * as tf from "@tensorflow/tfjs";
import { PredictFn, normalize } from "./prediction.type";
import { CustomCallbackArgs } from "@tensorflow/tfjs";
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
export const NeuralNetworkV2: PredictFn = async (
    inputData: number[][]
): Promise<number[]> => {
    const flatInput = inputData.reduce((acc, current) => {
        acc.push(...current);
        return acc;
    }, []);
    const inputTensor = tf.tensor3d(flatInput);
    const outputTensor = tf.tensor3d(flatInput);

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

    const reshapedInput = normalizedInput.reshape([
        normalizedInput.shape[0],
        1,
        1,
    ]);

    const reshapedOutput = normalizedOutput.reshape([
        normalizedOutput.shape[0],
        1,
    ]);

    // Build and compile the simple RNN model
    const model = tf.sequential();
    model.add(tf.layers.simpleRNN({ units: 8, inputShape: [1, 1] }));
    model.add(tf.layers.dense({ units: 1 }));
    model.compile({
        optimizer: "sgd",
        loss: "meanSquaredError",
        metrics: ["accuracy"],
    });

    const result = await model
        .fit(reshapedInput, reshapedOutput, {
            epochs: 100,
            callbacks: {
                onBatchEnd(batch, logs: tf.Logs) {
                    console.log(logs.acc);
                },
            } as CustomCallbackArgs,
        })
        .then(() => {
            // predict on next data
            const nextData = flatInput.slice(
                flatInput.length - 7 * 24
            );
            const normalizedNextWeekDays = tf
                .tensor2d(nextData.map((day) => [day]))
                .sub(inputMin)
                .div(inputMax.sub(inputMin))
                .reshape([nextData.length, 1, 1]);

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
            // Convert denormalizedPredictions tensor to a flat array
            return denormalizedPredictions.dataSync() as tf.TypedArray;
        });
    return [...result];
};
