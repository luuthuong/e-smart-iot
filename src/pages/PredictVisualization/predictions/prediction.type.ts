import * as tf from "@tensorflow/tfjs";

export type PredictFn = (inputData: number[][]) => Promise<number[]>;

export const normalize = (data: tf.Tensor<tf.Rank>) => {
    const min = tf.min(data);
    const max = tf.max(data);
    const normalizedData = data.sub(min).div(max.sub(min));
    return { normalizedData, min, max };
};
