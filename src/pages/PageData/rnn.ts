import * as tf from "@tensorflow/tfjs";
import { CustomCallbackArgs } from "@tensorflow/tfjs";
import { PredictFn, normalize } from "../PredictVisualization/predictions/prediction.type";
/*
    [
        [
            [462, 300, 462, 462, 421, 420, 325, 325, 421, 420, 462, 420, 325, 420, 325, 462, 421, 420, 421, 300, 462, 300, 325, 325], 
            [50, 52, 48, 33, 22, 56,50, 52, 48, 33, 22, 56,50, 52, 48, 33, 22, 56,50, 52, 48, 33, 22, 56], 
            [32, 33, 33, 33, 34, 28, 32, 33, 33, 33, 34, 28, 32, 33, 33, 33, 34, 28,32, 33, 33, 33, 34, 28]
        ],
        [
            [462, 300, 462, 462, 421, 420, 325, 325, 421, 420, 462, 420, 325, 420, 325, 462, 421, 420, 421, 300, 462, 300, 325, 325], 
            [50, 52, 48, 33, 22, 56,50, 52, 48, 33, 22, 56,50, 52, 48, 33, 22, 56,50, 52, 48, 33, 22, 56], 
            [32, 33, 33, 33, 34, 28, 32, 33, 33, 33, 34, 28, 32, 33, 33, 33, 34, 28,32, 33, 33, 33, 34, 28]
        ],
        ...
    ]
*/
const NeuralNetworkV2: PredictFn = async (
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

    async function trainModel() {
        await model.fit(normalizedInput, normalizedOutput, {
            epochs: 100,
            verbose: 1,
            callbacks: {
                onBatchEnd(batch, logs: tf.Logs) {
                    console.log(logs);
                },
            } as CustomCallbackArgs,
        });
    }

    const result = await trainModel().then(() => {
            // predict on next data
            const nextData = flatInput.slice(
                flatInput.length - 7 
            );

            const normalizedNextWeekDays = tf
                .tensor3d(nextData.map((day) => [[day]]))
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
