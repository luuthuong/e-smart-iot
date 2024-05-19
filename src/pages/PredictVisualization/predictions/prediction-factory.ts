import { LinearRegressionV2 } from "./linear-regression-v2";
import { PredictFn } from "./prediction.type";
import { NeuralNetwork } from "./neural-network";
import { recurrentNeutralNetwork } from "./neutral-network-v2";

export enum ModelPredict {
    NONE,
    RNN,
    LINEAR,
}

export const PredictFactory: {
    [x in ModelPredict]: PredictFn;
} = {
    [ModelPredict.LINEAR]: (arg) => {
        return LinearRegressionV2(arg).then((r) => {
            return r;
        });
    },
    [ModelPredict.RNN]: (arg) => {
        return recurrentNeutralNetwork(arg).then((r) => {
            return r;
        });
    },
    [ModelPredict.NONE]: async (data) => {
        return new Promise<number[]>(() => {});
    },
};
