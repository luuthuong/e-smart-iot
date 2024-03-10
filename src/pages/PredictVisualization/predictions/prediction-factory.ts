import { LinearRegression } from "./linear-regression";
import { NeuralNetwork } from "./neural-network";
import * as tf from '@tensorflow/tfjs'

export enum ModelPredict {
    NONE,
    RNN,
    LINEAR,
}

export const PredictFactory: {
    [x in ModelPredict] : (historyData: number[])=> Promise<tf.TypedArray>
} = {
    [ModelPredict.LINEAR]: LinearRegression,
    [ModelPredict.RNN]: NeuralNetwork,
    [ModelPredict.NONE]: () => {
        return new Promise<tf.TypedArray>(() =>{
        })
    }
};
