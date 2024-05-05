import * as tf from "@tensorflow/tfjs";
import { Sensor } from "../../../shared";

export type PredictFn = (inputData: number[][]) => Promise<number[]>;

export type PredictionFn = (inputData: Sensor[]) => Promise<number[][]>;

export const normalize = (data: tf.Tensor<tf.Rank>) => {
    const min = tf.min(data);
    const max = tf.max(data);
    const normalizedData = data.sub(min).div(max.sub(min));
    return { normalizedData, min, max };
};
