import {
    IonButton, IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonChip, IonCol, IonContent, IonGrid,
    IonHeader,
    IonIcon, IonInput, IonItem, IonLabel, IonModal, IonRow, IonText, IonTitle, IonToolbar,
} from "@ionic/react";
import React, {useEffect, useRef, useState} from 'react';
import Chart from "react-apexcharts";
import * as ReactApexChartProps from "react-apexcharts";
import {arrowForward, createOutline} from 'ionicons/icons'
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
    const modalConfigLimit = useRef<HTMLIonModalElement>(null);
    const [message, setMessage] = useState(
        'This modal example uses triggers to automatically open a modal when the button is clicked.'
    );
    const input = useRef<HTMLIonInputElement>(null);


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
            <IonCardContent className={'h-[350px] md:h-[300px]'}>

                <IonModal ref={modalConfigLimit} trigger={slug?.toString() || ''}>
                    <IonHeader>
                        <IonToolbar>
                            <IonButtons slot="start">
                                <IonButton onClick={() => modalConfigLimit.current?.dismiss()}>Cancel</IonButton>
                            </IonButtons>
                            <IonTitle>Welcome</IonTitle>
                            <IonButtons slot="end">
                                <IonButton strong={true} >
                                    Confirm
                                </IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent className="ion-padding">
                        <IonItem>
                            <IonLabel position="stacked">Enter your name</IonLabel>
                            <IonInput ref={input} type="text" placeholder="Your name" />
                        </IonItem>
                    </IonContent>
                </IonModal>

                <IonItem>
                    <IonGrid>
                        <IonRow>
                            <IonCol sizeSm={'6'} sizeMd={'4'} className={'flex justify-start items-center gap-x-0.5'}>
                                <IonText className={'text-sm'}>H</IonText>
                                <IonChip disabled color={'dark'}>
                                    {high}
                                </IonChip>
                            </IonCol>
                            <IonCol sizeSm={'6'} sizeMd={'4'}  className={'flex justify-start items-center gap-x-0.5'}>
                                <IonText className={'text-sm'}>L</IonText>
                                <IonChip disabled color={'dark'}>
                                    {low}
                                </IonChip>
                            </IonCol>
                            <IonCol sizeSm={'12'} sizeMd={'4'} className={'flex justify-center items-center '}>
                                <IonChip id={slug?.toString() || ''} outline={true} color={'light'}>
                                    <IonIcon color={'dark'} icon={createOutline}></IonIcon>
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
