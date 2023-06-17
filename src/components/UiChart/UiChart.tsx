import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonChip,
    IonIcon,
} from "@ionic/react";
import React, {useEffect, useState} from 'react';
import Chart from "react-apexcharts";
import * as ReactApexChartProps from "react-apexcharts";
import {arrowForward} from 'ionicons/icons'
import {Link} from "react-router-dom";

export type UiChartProp = {
    title?: string;
    subTitle?: string;
    className?: string;
    value?: number;
    minValue?: number;
    maxValue?: number;
    label?: string;
    // eslint-disable-next-line no-unused-vars
    formatter?(val: number): string
}

const UiChart = ({
                     title = "",
                     subTitle = "",
                     value = 0,
                     label = "",
                     className = "",
                     maxValue = 100,
                     formatter = () => value.toString()
                 }: UiChartProp) => {

    const [actValue, setActValue] = useState<number>(0);
    useEffect(() => {
        if (!value)
            return;
        if (!maxValue)
            return;
        if (value < maxValue) {
            const calc = ((value) / maxValue) * 100;
            setActValue(calc);
        }
    }, [value])

    const config: ReactApexChartProps.Props = {
        options: {
            chart: {
                type: 'radialBar'
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
                        strokeWidth: '67%',
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
                            formatter: formatter,
                            color: '#111',
                            fontSize: '36px',
                            show: true
                        }
                    },
                }
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
                lineCap: 'round'
            },
            labels: [label]
        },
        series: [
            actValue
        ],
    };

    return (
        <IonCard className={`min-w-[150px]  ${className}`}>
            <IonCardHeader>
                <div className={'flex ion-justify-content-between ion-align-items-center'}>
                    <p className={"text-lg text-grey-700"}> {title}</p>
                    <Link to={"/home/system/chart/1"}>
                        <IonChip color={"light"} slot={"end"} >
                            <IonIcon color={'primary'} icon={arrowForward}>
                            </IonIcon>
                        </IonChip>
                    </Link>
                </div>
            </IonCardHeader>
            {
                subTitle &&
                <IonCardSubtitle>
                    {subTitle}
                </IonCardSubtitle>
            }

            <IonCardContent>
                <Chart options={config.options} type={'radialBar'} series={config.series}></Chart>
            </IonCardContent>
        </IonCard>
    )
}

export default UiChart;
