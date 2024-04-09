import * as tf from "@tensorflow/tfjs";

export const runDemo = () => {
    const temperatureData = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65];
    const sequenceLength = 3; // Length of input sequence
    const numFeatures = 1; // Number of features (only temperature in this case)

    // Prepare data
    const input = [];
    const output = [];
    for (let i = 0; i < temperatureData.length - sequenceLength; i++) {
        const inputSequence = temperatureData.slice(i, i + sequenceLength);
        const outputValue = temperatureData[i + sequenceLength];
        input.push(inputSequence);
        output.push(outputValue);
    }

    // Convert data to tensors
    const xs = tf.tensor2d(input, [input.length, sequenceLength]);
    const ys = tf.tensor1d(output);

    // Define the model
    const model = tf.sequential();
    model.add(
        tf.layers.simpleRNN({
            units: 32,
            inputShape: [sequenceLength, numFeatures],
            activation: "relu",
        })
    );
    model.add(tf.layers.dense({ units: 1 }));

    // Compile the model
    model.compile({
        optimizer: tf.train.adam(),
        loss: "meanSquaredError",
    });

    // Train the model
    async function trainModel() {
        await model.fit(xs, ys, { epochs: 100 });
        console.log("Model trained");
    }

    // Make predictions
    function predictTemperature(inputData) {
        const inputTensor = tf.tensor2d(
            [inputData],
            [1, sequenceLength, numFeatures]
        );
        const prediction = model.predict(inputTensor);
        return prediction.dataSync()[0];
    }

    // Train the model and make predictions
    trainModel().then(() => {
        const newInputData = [55, 60, 65]; // New input data
        const prediction = predictTemperature(newInputData);
        console.log("Predicted temperature:", prediction);
    });
};
