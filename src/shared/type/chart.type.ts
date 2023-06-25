
export type SeriesOption = {
    name: string;
    data: (string | number)[]
}

export enum ChartTypeEnum {
    Temperature,
    Soil,
    Light
}

export type ChartName = {
    [x in ChartTypeEnum]: string
};

export type ChartLimit = {
    high?: string;
    low?: string;
}

export type ChartConfig = {
    formatter?(val: number): string;
    value?: (string| number)[];
    minValue?: number;
    maxValue?: number;
    label?: string;
    xAxisData?: (string| number)[];
    seriesOption?: SeriesOption[],
    type?:
        | 'line'
        | 'area'
        | 'bar'
        | 'pie'
        | 'donut'
        | 'radialBar'
        | 'scatter'
        | 'bubble'
        | 'heatmap'
        | 'candlestick'
        | 'boxPlot'
        | 'radar'
        | 'polarArea'
        | 'rangeBar'
        | 'rangeArea'
        | 'treemap'
}
