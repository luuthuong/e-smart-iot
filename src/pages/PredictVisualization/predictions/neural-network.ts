import * as tf from "@tensorflow/tfjs";

export const NeuralNetwork = (
    historyData: number[]
): Promise<tf.TypedArray> => {
    console.log("predict with RNN")
    // Normalize the data
    const normalize = (data: tf.Tensor<tf.Rank>) => {
        const min = tf.min(data);
        const max = tf.max(data);
        const normalizedData = data.sub(min).div(max.sub(min));
        return { normalizedData, min, max };
    };

    // Create tensors from the data
    const daysTensor = tf.tensor1d(historyData.map((x, i) => i));
    const historyDataTensor = tf.tensor1d(historyData);

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
    const reshapedData = normalizedTemps.reshape([
        normalizedTemps.shape[0],
        1,
    ]);

    // Build and compile the simple RNN model
    const model = tf.sequential();
    model.add(tf.layers.simpleRNN({ units: 8, inputShape: [1, 1] }));
    model.add(tf.layers.dense({ units: 1 }));
    model.compile({ optimizer: "sgd", loss: "meanSquaredError" });

    // Train the model
    return model.fit(reshapedDays, reshapedData, { epochs: 1000 }).then(() => {
        // Make predictions for the next week (replace this with your actual data)
        const nextWeekDays = [7, 8, 9, 10, 11, 12, 13];
        const normalizedNextWeekDays = tf
            .tensor2d(nextWeekDays.map((day) => [day]))
            .sub(daysMin)
            .div(daysMax.sub(daysMin))
            .reshape([nextWeekDays.length, 1, 1]);

        const predictions = model.predict(normalizedNextWeekDays);

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
};
