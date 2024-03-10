import { Timestamp, collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { firestore } from "../../database";
import { HISTORY_SENSOR } from "../../shared/constant";

export const onPredict = (resolve: (result: any) => any) => {
    const semsorRef = collection(firestore, HISTORY_SENSOR);
    const queryCollection = [orderBy("time", "desc"), limit(150)];
    const snapshot = getDocs(query(semsorRef, ...queryCollection));
    snapshot.then((res) => {
        const data = res.docs.map((x) => ({
            ...x.data(),
            id: x.id,
            time: (x.data().time as Timestamp).toMillis(),
            timeString: x.data().time.toDate() as Date,
        }));
        const result = [];
        const total = data.length;
        let step = Math.floor(total / 23);
        if (step == 0) step = 1;

        for (let i = 0; i < 24; i++) {
            if (i === 0) {
                result.push(data[i]);
                continue;
            }

            const index = i + step;
            if (index > total) {
                result.push(data[total - 1]);
                return;
            }

            result.push(data[index]);
        }
        // Template for sensor data of tomorrow
        const tomorrowTemplate = {
            time: 1701782970226, // Replace with tomorrow's timestamp
            soil: 97,
            rain: false,
            light: 0,
            temperature: 0,
            id: "e72cf36f-f9c5-4dee-b11a-951c0e3dc638",
        };

        try {
            // Preprocess the data - convert object properties into numerical data
            const processedTodayData = data.map((item) => [
                item.time, // Time
                item.light,
                item.soil,
                item.temperature,
            ]);

            // Extract input features (excluding target features)
            const inputFeatures = processedTodayData.map((item) => [
                item[0], // Time
                item[1], // Light
                item[2], // Soil
                item[3], // Temperature
            ]);

            // Extract output features (temperature, light, soil)
            const outputFeatures = processedTodayData.map((item) => [
                item[3], // Temperature
                item[1], // Light
                item[2], // Soil
            ]);

            // Convert extracted features into tensors with explicit shape
            const inputTensor = tf.tensor2d(inputFeatures, [
                inputFeatures.length,
                inputFeatures[0].length,
            ]);
            const outputTensor = tf.tensor2d(outputFeatures, [
                outputFeatures.length,
                outputFeatures[0].length,
            ]);

            // Normalize data (you may need to adjust this based on your data)
            const inputMax = inputTensor.max();
            const inputMin = inputTensor.min();
            const outputMax = outputTensor.max();
            const outputMin = outputTensor.min();

            const normalizedInputs = inputTensor
                .sub(inputMin)
                .div(inputMax.sub(inputMin));
            const normalizedOutputs = outputTensor
                .sub(outputMin)
                .div(outputMax.sub(outputMin));

            // Create and train the model (simplified for demonstration)
            const model = tf.sequential();
            model.add(
                tf.layers.dense({
                    units: 3,
                    inputShape: [inputFeatures[0].length],
                })
            );
            model.compile({
                optimizer: "sgd",
                loss: "meanSquaredError",
                metrics: ["mse"],
            });

            // Train the model (you may need more epochs and proper data splitting for training)
            model
                .fit(normalizedInputs, normalizedOutputs, { epochs: 100 })
                .then(console.log);

            // Prepare input data for prediction (using tomorrow's template)
            const timestampsOfTomorrow = generateTimestampsForTomorrow(
                result.length
            );
            const predicted = timestampsOfTomorrow.map((timestamp) => {
                const inputForTomorrow = [
                    timestamp,
                    tomorrowTemplate.light,
                    tomorrowTemplate.soil,
                    tomorrowTemplate.temperature,
                ];
                const inputTensorForTomorrow = tf.tensor2d(
                    [inputForTomorrow],
                    [1, inputForTomorrow.length]
                );
                const normalizedInputForTomorrow = inputTensorForTomorrow
                    .sub(inputMin)
                    .div(inputMax.sub(inputMin));

                const predictedOutputForTomorrow = model.predict(
                    normalizedInputForTomorrow
                );
                const predicted = predictedOutputForTomorrow
                    .mul(outputMax.sub(outputMin))
                    .add(outputMin)
                    .arraySync();

                const [light, soil, temperature] = predicted[0].map(
                    (value: any, index: number) => {
                        if (index === 2) {
                            // Temperature index
                            return value < 0 ? 0 : Math.min(value, 32);
                        }
                        return value < 0 ? 0 : value;
                    }
                );

                return { timestamp, light, soil, temperature };
            });
            resolve({
                data: result,
                predicted,
            });
        } catch (error) {
            console.error("Error:", error);
        }
    });
};