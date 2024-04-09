import { LinearRegressionV2 } from "./linear-regression-v2";
import { PredictFn } from "./prediction.type";
import { NeuralNetwork } from "./neural-network";

export enum ModelPredict {
    NONE,
    RNN,
    LINEAR,
}

export const PredictFactory: {
    [x in ModelPredict]: PredictFn
} = {
    [ModelPredict.LINEAR]: LinearRegressionV2,
    [ModelPredict.RNN]: NeuralNetwork,
    [ModelPredict.NONE]: async (data) => {
        return new Promise<number[]>(() => {});
    },
};
