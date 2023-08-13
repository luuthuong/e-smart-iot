import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonChip,
    IonCol,
    IonGrid,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel, IonNavLink, IonRouterLink,
    IonRow,
    IonSkeletonText,
    IonText,
    useIonToast,
} from "@ionic/react";
import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import Chart, * as ReactApexChartProps from "react-apexcharts";
import {arrowForward, checkmarkOutline, createOutline} from 'ionicons/icons'
import {ChartConfig, ChartTypeEnum, initChartConfig, Limit} from "../../shared";
import {onValue, ref, set} from "firebase/database";
import {database} from "../../database";
import {BackDropContext} from "../../shared/context";
import './ui-chart.css';

export type UiChartProp = ChartConfig & {
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
                     ...props
                 }: UiChartProp) => {
    const [limit, setLimit] = useState<Limit>({high: 100, low: 0});
    const [config, setConfig] = useState<ReactApexChartProps.Props | undefined>(undefined);
    const [editMode, setEditMode] = useState(false);
    const iHigh = useRef<HTMLIonInputElement>(null);
    const iLow = useRef<HTMLIonInputElement>(null);

    const [loading, setLoading] = useState(true);


    const [present] = useIonToast();
    const presentToast = (msg: string, color: string, position: 'top' | 'middle' | 'bottom' = 'bottom') => {
        present({
            message: msg,
            duration: 1500,
            position: position,
            color: color
        });
    };

    const getLimit = useCallback((type: ChartTypeEnum) => {
            const basePath = "settings/limits"
            switch (type) {
                case ChartTypeEnum.Temperature:
                    return `${basePath}/temp`;
                case ChartTypeEnum.Soil:
                    return `${basePath}/soil`;
                case ChartTypeEnum.Light:
                    return `${basePath}/light`;
                default:
                    return '/'
            }
        },
        [slug]);

    const dispatchBackdrop = useContext(BackDropContext)!;

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
            minValue: props.minValue,
        }
        setConfig(initChartConfig(config));
        const limitPath = 'settings/limits';

        onValue(ref(database, getLimit(slug!)), (snapshot) => {
            const response: Limit = snapshot.val();
            setLimit(response);
        });

        const timeout = setTimeout(() => {
            setLoading(false);
        }, 200);
        return () => {
            clearTimeout(timeout);
        }
    }, [value]);

    const inValidInput = (...params: Limit[]) => {
        return params.some(x => [x.low, x.high].some(x1 => +x1 < 0 || isNaN(x1)) || +x.high < +x.low);
    }

    const onSaveLimit = () => {
        if ([iHigh, iLow].some(x => !x || !x.current))
            return;

        const data = {
            high: parseInt(iHigh?.current?.value as string),
            low: parseInt(iLow?.current?.value as string)
        } as Limit;

        if (inValidInput(data)) {
            presentToast('Input data invalid, please check again!', 'danger', "top");
            console.error(`data invalid! ${JSON.stringify(data)}`);
            return;
        }

        set(ref(database, getLimit(slug!)), data).then(res => {
            presentToast('Success', 'light', "top");
            setLimit({...data});
        });

    }

    const onEditMode = () => {
        if (editMode) {
            onSaveLimit();
        }
        setEditMode(prev => !prev);
    }

    return (
        <>
            <IonCard className={`min-w-[150px] ${className}`}>
                <IonCardHeader>
                    <div className={'flex ion-justify-content-between ion-align-items-center'}>
                        <IonChip color={'dark'} slot={'start'}>
                            {
                                icon && <IonIcon icon={icon} color="primary"></IonIcon>
                            }
                            <IonLabel className={'text-grey-700 text-lg text-grey-700'}>{title}</IonLabel>
                        </IonChip>
                        <IonChip color={"light"} slot={"end"}>
                            <IonRouterLink className={'item-navigate'} routerLink={`/system/chart/${slug}`}>
                                <IonIcon color={'primary'} icon={arrowForward}>
                                </IonIcon>
                            </IonRouterLink>
                        </IonChip>
                    </div>
                </IonCardHeader>
                {
                    subTitle &&
                    <IonCardSubtitle>
                        {subTitle}
                    </IonCardSubtitle>
                }
                <IonCardContent className={'h-[350px] md:h-[300px]'}>
                    <IonItem>
                        <IonGrid>
                            <IonRow>
                                <IonCol sizeSm={'6'} sizeMd={'4'}
                                        className={'flex justify-start items-center gap-x-0.5'}>
                                    <IonText className={'text-md font-semibold text-gray-600 mr-2'}>H</IonText>
                                    {
                                        loading ?
                                            <IonSkeletonText animated={true}
                                                             className={'w-8 h-6 rounded-xl'}></IonSkeletonText>
                                            : !editMode ? <IonChip disabled color={'dark'}>
                                                    {limit.high}
                                                </IonChip> :
                                                <IonInput ref={iHigh} type="number" value={limit.high}
                                                          placeholder="00"></IonInput>}
                                </IonCol>
                                <IonCol sizeSm={'6'} sizeMd={'4'}
                                        className={'flex justify-start items-center gap-x-0.5'}>
                                    <IonText className={'text-md font-semibold text-gray-600 mr-2'}>L</IonText>
                                    {
                                        loading ?
                                            <IonSkeletonText animated={true}
                                                             className={'w-8 h-6 rounded-xl'}></IonSkeletonText>
                                            : !editMode ? <IonChip disabled color={'dark'}>
                                                {limit.low}
                                            </IonChip> : <IonInput ref={iLow} type="number" value={limit.low}
                                                                   placeholder="00"></IonInput>
                                    }
                                </IonCol>
                                <IonCol sizeSm={'12'} sizeMd={'4'} className={'flex justify-center items-center '}>
                                    {!loading && <IonChip onClick={onEditMode} color={'light'}>
                                        <IonIcon color={'dark'}
                                                 icon={!editMode ? createOutline : checkmarkOutline}></IonIcon>
                                    </IonChip>}
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </IonItem>
                    {
                        loading ? <div className={'w-full h-[220px] flex items-center justify-center'}>
                            <IonSkeletonText animated={true} className={' w-40 h-40 rounded-full '}></IonSkeletonText>
                        </div> : config &&
                            <Chart height={'250'} options={config.options} type={'radialBar'}
                                   series={config.series}></Chart>
                    }
                </IonCardContent>
            </IonCard>
        </>
    )
}

export default UiChart;
