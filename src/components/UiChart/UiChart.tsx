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
import {ChartConfig, ChartTypeEnum, initChartConfig} from "../../shared";

export type UiChartProp = ChartConfig & {
    title?: string;
    subTitle?: string;
    className?: string;
    slug?: ChartTypeEnum;
}

const UiChart = ({
                     title = "",
                     subTitle = "",
                     value = [0],
                     label = "",
                     className = "",
                     maxValue = 100,
                     slug,
                     ...props
                 }: UiChartProp) => {

    const [config, setConfig] = useState<ReactApexChartProps.Props | undefined>(undefined);

    useEffect(() => {
        if (!value)
            return;
        const calc = value[0] < maxValue ? Math.round(((Number(value[0])) / maxValue) * 100) : value[0] > maxValue ? maxValue : value[0];
        const config: ChartConfig = {
            type: props.type,
            value: [calc],
            label: label,
            formatter: props.formatter,
            maxValue: maxValue,
            minValue: props.minValue
        }
        setConfig(initChartConfig(config));
    }, [value]);


    return (
        <IonCard className={`min-w-[150px] ${className}`}>
            <IonCardHeader>
                <div className={'flex ion-justify-content-between ion-align-items-center'}>
                    <p className={"text-lg text-grey-700"}> {title}</p>
                    <Link to={`/home/chart/${slug}`}>
                        <IonChip color={"light"} slot={"end"}>
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
            <IonCardContent className={'h-[300px]'}>
                {
                    config &&
                    <Chart height={'300'} options={config.options} type={'radialBar'} series={config.series}></Chart>
                }
            </IonCardContent>
        </IonCard>
    )
}

export default UiChart;
