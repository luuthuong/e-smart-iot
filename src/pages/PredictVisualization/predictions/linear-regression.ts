import * as tf from "@tensorflow/tfjs";

export const LinearRegression = (historyData: number[]): Promise<tf.TypedArray> => {
    console.log("predict data with linear gression");
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

    // Build and compile the model
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
    model.compile({ optimizer: "sgd", loss: "meanSquaredError" });

    return model.fit(normalizedDays, normalizedTemps, { epochs: 1000 }).then(() => {
        // Make predictions for the next week (replace this with your actual data)
        const nextWeekDays = [7, 8, 9, 10, 11, 12, 13];
        const normalizedNextWeekDays = tf
            .tensor1d(nextWeekDays)
            .sub(daysMin)
            .div(daysMax.sub(daysMin));

        const predictions = model.predict(normalizedNextWeekDays) as tf.Tensor<tf.Rank>;

        // Denormalize the predictions
        const denormalizedPredictions = predictions
            .mul(tempsMax.sub(tempsMin))
            .add(tempsMin);

        return denormalizedPredictions.dataSync() as tf.TypedArray;
    });
};
