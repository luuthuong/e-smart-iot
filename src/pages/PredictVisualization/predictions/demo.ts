// Import TensorFlow.js
import * as tf from "@tensorflow/tfjs";

export const onDemoPredict = async () => {
    // Define the neural network architecture
    const model = tf.sequential();
    model.add(
        tf.layers.dense({ inputShape: [4], units: 64, activation: "relu" })
    );
    model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

    // Compile the model
    model.compile({ optimizer: "adam", loss: "meanSquaredError" });

    // Generate some dummy data (replace this with your actual data)
    const temperature = [
        [20, 25],
        [25, 30],
        [22, 18],
        [28, 23],
    ];
    const light = [
        [0.5, 0.7],
        [0.8, 0.9],
        [0.6, 0.4],
        [0.7, 0.6],
    ];
    const soil = [[0.3], [0.4], [0.5], [0.2]];

    // Convert data to tensors
    const temperatureTensor = tf.tensor2d(temperature);
    const lightTensor = tf.tensor2d(light);
    const soilTensor = tf.tensor2d(soil);

    // Train the model
    model
        .fit([temperatureTensor, lightTensor], soilTensor, { epochs: 100 })
        .then(() => {
            // Make predictions for next week
            const nextWeekTemperature = [
                [21, 24],
                [23, 27],
                [24, 29],
                [19, 22],
            ];
            const nextWeekLight = [
                [0.55, 0.75],
                [0.65, 0.68],
                [0.72, 0.85],
                [0.45, 0.62],
            ];
            const nextWeekTemperatureTensor = tf.tensor2d(nextWeekTemperature);
            const nextWeekLightTensor = tf.tensor2d(nextWeekLight);
            const predictions = model.predict([
                nextWeekTemperatureTensor,
                nextWeekLightTensor,
            ]);
            predictions.print();
        });
};
