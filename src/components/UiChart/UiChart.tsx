import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonChip, IonCol, IonGrid,
    IonIcon, IonItem, IonLabel, IonRow, IonText, IonTitle,
} from "@ionic/react";
import React, {useEffect, useState} from 'react';
import Chart from "react-apexcharts";
import * as ReactApexChartProps from "react-apexcharts";
import {arrowForward} from 'ionicons/icons'
import {Link} from "react-router-dom";
import {ChartConfig, ChartLimit, ChartTypeEnum, initChartConfig} from "../../shared";

export type UiChartProp = ChartConfig & ChartLimit & {
    title?: string;
    subTitle?: string;
    className?: string;
    slug?: ChartTypeEnum;
    icon?: string;
}

const UiChart = ({
                     title = "",
                     subTitle = "",
                     value = [0],
                     label = "",
                     className = "",
                     maxValue = 100,
                     slug,
                     icon,
                     high = '100',
                     low = '0',
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
                    <IonChip color={'dark'} slot={'start'}>
                        {
                            icon && <IonIcon icon={icon} color="primary"></IonIcon>
                        }
                        <IonLabel className={'text-grey-700 text-lg text-grey-700'}>{title}</IonLabel>
                    </IonChip>
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
                <IonItem>
                    <IonGrid>
                        <IonRow>
                            <IonCol size={'auto'} className={'mr-2 flex justify-start items-center '}>
                                <IonText className={'font-semibold text-gray-500'}>Setting</IonText>
                            </IonCol>
                            <IonCol size={'4'} className={'flex justify-start items-center gap-x-1'}>
                                <IonText>HIGH</IonText>
                                <IonChip disabled color={'dark'}>
                                    {high}
                                </IonChip>
                            </IonCol>
                            <IonCol size={'4'}  className={'flex justify-start items-center gap-x-1'}>
                                <IonText>LOW</IonText>
                                <IonChip disabled color={'dark'}>
                                    {low}
                                </IonChip>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </IonItem>
                {
                    config &&
                    <Chart height={'250'} options={config.options} type={'radialBar'} series={config.series}></Chart>
                }
            </IonCardContent>
        </IonCard>
    )
}

export default UiChart;
