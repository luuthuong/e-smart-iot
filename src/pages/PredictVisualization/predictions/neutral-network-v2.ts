import * as tf from "@tensorflow/tfjs";
import { PredictFn, normalize } from "./prediction.type";
import { CustomCallbackArgs } from "@tensorflow/tfjs";

export const NeuralNetworkV2: PredictFn = async (
    inputData: number[][]
): Promise<number[]> => {
    const data = [
        [
            31, 33, 31, 31, 35, 34, 35, 31, 34, 35, 32, 35, 33, 34, 35, 32, 35,
            32, 33, 32, 31, 35, 35, 31,
        ],
        [
            34, 34, 34, 35, 31, 33, 35, 35, 31, 34, 31, 31, 33, 33, 31, 32, 32,
            34, 35, 35, 33, 35, 34, 32,
        ],
        [
            34, 31, 31, 32, 34, 35, 31, 31, 35, 35, 33, 33, 35, 33, 32, 31, 31,
            33, 32, 33, 32, 35, 35, 33,
        ],
        [
            31, 32, 32, 32, 32, 32, 33, 32, 32, 34, 33, 31, 34, 33, 33, 34, 35,
            32, 33, 35, 31, 35, 34, 31,
        ],
    ];
    const flatInput = data.reduce((acc, current) => {
        acc.push(...current);
        return acc;
    }, []);
    const inputTensor = tf.tensor1d(flatInput);
    const outputTensor = tf.tensor1d(flatInput);

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
            const nextData = flatInput.slice(
                flatInput.length - 7*24
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
