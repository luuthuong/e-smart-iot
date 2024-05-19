import * as tf from "@tensorflow/tfjs";
import { PredictFn, normalize } from "./prediction.type";

export const NeuralNetwork: PredictFn = async (
    _data
): Promise<number[]> => {
    console.log("predict with RNN");
    const data = _data as number[][];
    // Create tensors from the data
    const flatData = data.reduce((acc, current) => {
        acc.push(...current);
        return acc;
    }, []);

    const daysTensor = tf.tensor1d(flatData.map((x, i) => i));
    const historyDataTensor = tf.tensor1d(flatData);

    // Normalize the data
    const {
        normalizedData: normalizedDays,
        min: daysMin,
        max: daysMax,
    } = normalize(daysTensor);
    const {
        normalizedData: normalizedTemps,
        min: tempsMin,
        max: tempsMax,
    } = normalize(historyDataTensor);

    // Reshape the data to make it suitable for RNN
    const reshapedDays = normalizedDays.reshape([
        normalizedDays.shape[0],
        1,
        1,
    ]);

    const reshapedData = normalizedTemps.reshape([normalizedTemps.shape[0], 1]);

    // Build and compile the simple RNN model
    const model = tf.sequential();
    model.add(tf.layers.simpleRNN({ units: 8, inputShape: [1, 1] }));
    model.add(tf.layers.dense({ units: 1 }));
    model.compile({ optimizer: "sgd", loss: "meanSquaredError" });

    // Train the model
    const result = await model
        .fit(reshapedDays, reshapedData, { epochs: 1000 })
        .then(() => {
            // Make predictions for the next week (replace this with your actual data)
            const nextWeekDays = [7, 8, 9, 10, 11, 12, 13];
            const normalizedNextWeekDays = tf
                .tensor2d(nextWeekDays.map((day) => [day]))
                .sub(daysMin)
                .div(daysMax.sub(daysMin))
                .reshape([nextWeekDays.length, 1, 1]);

            const predictions = model.predict(
                normalizedNextWeekDays
            ) as tf.Tensor<tf.Rank>;

            // Reshape predictions and denormalize
            const reshapedPredictions = predictions.reshape([
                nextWeekDays.length,
                1,
            ]);
            
            const denormalizedPredictions = reshapedPredictions
                .mul(tempsMax.sub(tempsMin))
                .add(tempsMin);
            // Convert denormalizedPredictions tensor to a flat array
            return denormalizedPredictions.dataSync() as tf.TypedArray;
        });
    return [...result].map(x => +x.toFixed(2));
};
