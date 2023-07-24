import * as ReactApexChartProps from "react-apexcharts";
import {ChartConfig} from "../type";

export default function initChartConfig(config: ChartConfig){
    return {
        options: {
            chart: {
                type: config.type,
            },
            plotOptions: {
                radialBar: {
                    startAngle: -360,
                    endAngle: 0,
                    hollow: {
                        margin: 0,
                        size: '70%',
                        background: '#fff',
                        image: undefined,
                        imageOffsetX: 0,
                        imageOffsetY: 0,
                        position: 'front',
                        dropShadow: {
                            enabled: true,
                            top: 3,
                            left: 0,
                            blur: 4,
                            opacity: 0.24
                        }
                    },
                    track: {
                        background: '#fff',
                        strokeWidth: '50%',
                        margin: 0, // margin is in pixels
                        dropShadow: {
                            enabled: true,
                            top: -3,
                            left: 0,
                            blur: 4,
                            opacity: 0.35
                        }
                    },
                    dataLabels: {
                        show: true,
                        name: {
                            offsetY: -10,
                            show: true,
                            color: '#888',
                            fontSize: '17px'
                        },
                        value: {
                            formatter: config.formatter ?? ((val) => val.toString()),
                            color: '#111',
                            fontSize: '36px',
                            show: true
                        }
                    },
                }
            },
            xaxis: {
              categories: config.xAxisData ?? []
            },
            yaxis:{
              max: config.maxValue ?? undefined,
                min: config.minValue ?? undefined
            },
            colors: ["#526D82"],
            fill: {
                type: 'gradient',
                gradient: {
                    shade: 'dark',
                    type: 'horizontal',
                    shadeIntensity: 0.5,
                    gradientToColors: ['#2B2730'],
                    inverseColors: true,
                    opacityFrom: 1,
                    opacityTo: 1,
                    stops: [0, 100]
                }
            },
            stroke: {
                lineCap: 'round',
                curve: 'smooth',
                width: 3
            },
            markers:{
              size: 4
            },
            labels: [config.label ?? ""],
        },
        series: config.value ?? config.seriesOption?.map(({name, data}) => ({name,data})) ?? [],
    } as ReactApexChartProps.Props;
}
