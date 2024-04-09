import * as tf from "@tensorflow/tfjs";
import { CustomCallbackArgs } from "@tensorflow/tfjs";
import { Sensor } from "../../shared";
import { normalize } from "./predictions/prediction.type";

export const onPredictSoil = (input: Sensor[], predictData : number[][]) => {
    const data = input.map((item) => ({
        input: [item.temperature, item.light],
        output: [item.soil],
    }));

    // Convert data into tensors
    const xs = tf.tensor2d(
        data.map((item) => item.input),
        [data.length, 2]
    );
    const ys = tf.tensor2d(
        data.map((item) => item.output),
        [data.length, 1]
    );

    const {
        max: xsMax,
        min: xsMin,
        normalizedData: normalizedXs,
    } = normalize(xs);

    const {
        max: ysMax,
        min: ysMin,
        normalizedData: normalizedYs,
    } = normalize(ys);

    // Define the model
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, inputShape: [2] }));

    // Compile the model
    model.compile({
        optimizer: "sgd",
        loss: "meanSquaredError",
        metrics: ["accuracy"],
    });

    // Train the model
    async function trainModel() {
        await model.fit(normalizedXs, normalizedYs, {
            epochs: 100,
            callbacks: {
                onBatchEnd(batch, logs: tf.Logs) {
                    console.log(logs)
                },
            } as CustomCallbackArgs,
        });
    }

    async function predictHumidity(temperature: number, light: number) {
        const inputTensor = tf.tensor2d([[temperature, light]]);
        const normalizedInput = inputTensor.sub(xsMin).div(xsMax.sub(xsMin));
        const prediction = model.predict(normalizedInput);
        const denormalizedPrediction = (prediction as tf.Tensor<tf.Rank>)
            .mul(ysMax.sub(ysMin))
            .add(ysMin);
        return denormalizedPrediction.dataSync()[0];
    }

    return trainModel().then(async () => {
        const promises = predictData.map((item) =>
            predictHumidity(item[0], item[1]).then(x => +x.toFixed(2))
        );
        return Promise.all(promises);
    });
};

