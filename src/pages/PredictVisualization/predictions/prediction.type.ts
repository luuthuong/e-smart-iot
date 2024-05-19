import * as tf from "@tensorflow/tfjs";

export type Data2D<T> = T[][]; 
export type Data3D<T> = T[][][]; 

export type PredictFn = (inputData: Data2D<number>| Data3D<number>) => Promise<number[]>;

export type PredictionFn = (inputData: Data3D<number>) => Promise<number[]>;

export const normalize = (data: tf.Tensor<tf.Rank>) => {
    const min = tf.min(data);
    const max = tf.max(data);
    const normalizedData = data.sub(min).div(max.sub(min));
    return { normalizedData, min, max };
};
