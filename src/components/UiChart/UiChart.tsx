import {IonCard, IonCardContent, IonCardHeader} from "@ionic/react";
import React from 'react';
import Chart from "react-apexcharts";
import * as ReactApexChartProps from "react-apexcharts";
import {ApexOptions} from "apexcharts";

export type UiChartProp = {
    className: string;
    data: string[];
    label: string[];
    series: ApexOptions['series'];
    xAxisCategories: string[] | number[];
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

const UiChart = (props: UiChartProp) =>{
    const stateChart: ReactApexChartProps.Props = {
        options:{
            chart: {
                type: 'radialBar'
            },
            plotOptions:{
                radialBar:{
                    hollow:{
                        size: '80%'
                    }
                }
            },
            xaxis: {
                categories: props.xAxisCategories
            },
            labels: props.label
        },
        series: props.series,
    };
    return (
        <IonCard  className={'min-w-[200px] max-w-sm'}>
            <IonCardHeader >
                Title
            </IonCardHeader>
            <IonCardContent>
                <Chart options={stateChart.options} type={'radialBar'} series={stateChart.series} ></Chart>
            </IonCardContent>
        </IonCard>
    )
}

export default UiChart;
