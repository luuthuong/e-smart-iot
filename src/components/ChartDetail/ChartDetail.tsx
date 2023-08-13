import React, {useEffect, useRef, useState} from "react";
import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonChip,
    IonCol,
    IonDatetime,
    IonDatetimeButton,
    IonGrid,
    IonIcon, IonItem,
    IonList,
    IonModal,
    IonRefresher,
    IonRefresherContent, IonRouterLink,
    IonRow,
    IonSelect,
    IonSelectOption, IonSkeletonText,
    IonToggle,
    RefresherEventDetail,
    SelectChangeEventDetail
} from "@ionic/react";
import {arrowBackOutline} from "ionicons/icons";
import Chart, * as ReactApexChartProps from "react-apexcharts";
import {ChartTypeEnum, initChartConfig} from "../../shared";
import {ChartConstant} from "../../shared/constant";
import {IonSelectCustomEvent} from "@ionic/core/dist/types/components";
import {onValue, ref} from "firebase/database";
import {and, collection, getDocs, limit, orderBy, query, Timestamp, where} from 'firebase/firestore'
import {database, firestore, SensorHistory} from "../../database";
import moment from "moment";
import {OverlayEventDetail} from "@ionic/react/dist/types/components/react-component-lib/interfaces";


type ChartDetailData = {
    data: number;
    time: string
}

// export type ChartDetailProps = {}
export const ChartDetail = () => {
    const [config, setConfig] = useState<ReactApexChartProps.Props | null>(null);
    const [label, setLabel] = useState("");
    const [option, setOption] = useState<ChartTypeEnum>();

    const [realtimeMode, setRealtimeMode] = useState(true);

    const dateFromRef = useRef<HTMLIonDatetimeElement | null>(null);
    const dateToRef = useRef<HTMLIonDatetimeElement | null>(null);

    const [loading, setLoading] = useState(true);

    const getParams = () =>{
        const path = window.location.pathname;
        const parts = path.split('/');
        const index = parts.indexOf('system') + 1;
        if (index > 0 && index < parts.length) {
            return parts[index+1]
        }
        return undefined;
    }


    useEffect(() => {
        const param = getParams();
        if (!param)
            return;
        setLabel(ChartConstant[+param as ChartTypeEnum]);
        setOption(+param as ChartTypeEnum);
    }, []);

    const getPathByType = (): 'light' | 'soil' | 'temperature' => {
        const param = getParams() as unknown as ChartTypeEnum;
        switch (param) {
            case ChartTypeEnum.Light:
                return 'light'
            case ChartTypeEnum.Temperature:
                return 'temperature'
            case ChartTypeEnum.Soil:
                return 'soil'
            default:
                return "light"
        }
    }

    useEffect(() => {
        setLoading(true);
        if (realtimeMode) {
            const data: ChartDetailData[] = [];
            const interval = setInterval(() => {
                onValue(ref(database, `actValues/sensors/${getPathByType()}`), snapshot => {
                    if (data.length >= 10)
                        data.splice(0, 1)
                    data.push({
                        time: new Date().toTimeString().split(' ')[0],
                        data: snapshot.val()
                    })
                }, {
                    onlyOnce: true
                });

                const initConfig = initChartConfig({
                    type: 'line',
                    label: 'Chart',
                    maxValue: realtimeMode ? undefined : 100,
                    formatter(val: number): string {
                        return `${val}%`;
                    },
                    seriesOption: [
                        {
                            name: 'data',
                            data: data.map(x => x.data)
                        }
                    ],
                    xAxisData: data.map(x => x.time)
                });
                setConfig({...initConfig});
                setLoading(false)
            }, 1000);

            return () => {
                clearInterval(interval);
            }
        }

        const timeout = setTimeout(() => {
            setLoading(false)
        }, 200);
        onFilterHistorySensor();
        return () => {
            clearTimeout(timeout);
        }
    }, [realtimeMode, option]);

    const onFilterHistorySensor = (from?: Date, to?: Date) => {

        if (from && to && from > to)
            throw ('filter invalid');

        let timeStampFrom: Timestamp | null = from ? Timestamp.fromDate(from) : Timestamp.fromDate(new Date(0));
        let timeStampTo: Timestamp = Timestamp.fromDate(to || new Date());

        const queryRef = collection(firestore, "History-Sensor");
        const q = query(
            queryRef,
            and(
                where("time", "<=", timeStampTo),
                where("time", ">=", timeStampFrom),
            ),
            orderBy("time", "desc"), limit(10));

        getDocs(q).then(snapshot => {
            const dataResponse = snapshot.docs.map(x => x.data() as SensorHistory);
            const data: ChartDetailData[] = dataResponse.map(x => ({
                data: x[getPathByType()],
                time: moment(x.time.toDate()).format("DD-MM-yyyy HH:mm:ss")
            }));

            const initConfig = initChartConfig({
                type: 'line',
                label: 'Chart',
                maxValue: 100,
                formatter(val: number): string {
                    return `${val}%`;
                },
                seriesOption: [
                    {
                        name: 'data',
                        data: data.map(x => x.data)
                    }
                ],
                xAxisData: data.map(x => x.time)
            });
            setConfig({...initConfig});
        });
    }

    const handleRefresh =
        // eslint-disable-next-line no-undef
        (event: CustomEvent<RefresherEventDetail>) => {
            setTimeout(() => {
                event.detail.complete();
            }, 1000);
        };

    const onOptionChange = (e: IonSelectCustomEvent<SelectChangeEventDetail<ChartTypeEnum>>) => {
        const newPath = window.location.pathname.replace(/\/\d+$/, `/${e.detail.value}`);
        window.history.pushState({}, '', newPath);
        setOption(e.detail.value);
        setLabel(ChartConstant[e.detail.value as ChartTypeEnum])
    }

    const onDatetimeModalDismiss = (ev: CustomEvent<OverlayEventDetail>) => {
        const from = dateFromRef.current?.value as string;
        const to = dateToRef.current?.value as string;
        onFilterHistorySensor(from ? new Date(from) : undefined, to ? new Date(to) : undefined);
    }

    return (
        <IonGrid>
            <IonRow>
                <IonCol className={`mx-auto ${realtimeMode && 'hidden'}`} size={'10'} sizeMd={'4'} sizeLg={'6'}
                        sizeXl={'4'}>
                    <IonRow>
                        <IonCol className={'flex gap-x-1 justify-center'} size={'12'} sizeMd={'12'} sizeLg={'6'}>
                        <span
                            className={'text-xl font-medium text-gray-800 flex items-center justify-center h-full w-[50px]'}>From</span>
                            <IonModal onWillDismiss={onDatetimeModalDismiss} keepContentsMounted={true}>
                                <IonDatetime ref={dateFromRef} presentation={'date'} id={'dateFrom'}></IonDatetime>
                            </IonModal>
                            <IonDatetimeButton datetime={'dateFrom'}></IonDatetimeButton>
                        </IonCol>

                        <IonCol className={'flex gap-x-1 mx-auto justify-center'} size={'12'} sizeMd={'12'}
                                sizeLg={'6'}>
                        <span
                            className={'text-xl font-medium text-gray-800 flex items-center justify-center h-full w-[50px]'}>
                            To
                        </span>
                            <IonDatetimeButton datetime={'dateTo'}></IonDatetimeButton>
                            <IonModal onWillDismiss={onDatetimeModalDismiss} keepContentsMounted={true}>
                                <IonDatetime presentation={'date'} ref={dateToRef} id="dateTo"></IonDatetime>
                            </IonModal>
                        </IonCol>
                    </IonRow>
                </IonCol>
            </IonRow>

            <IonRow>
                <IonCol>
                    <IonRefresher slot="fixed" pullFactor={0.5} pullMin={100} pullMax={200}
                                  onIonRefresh={handleRefresh}>
                        <IonRefresherContent pullingIcon="chevron-down-circle-outline"
                                             pullingText="Pull to refresh"
                                             refreshingSpinner="circles"
                                             refreshingText="Refreshing...">
                        </IonRefresherContent>
                    </IonRefresher>

                    <IonCard>
                        <IonCardHeader>

                            <div className={'flex ion-justify-content-between ion-align-items-center'}>
                                <div className={'flex items-center flex-wrap gap-x-1'}>
                                    <IonChip color={"light"} className={"w-fit flex justify-center"}>
                                        <IonRouterLink routerLink={"/system"}>
                                            <IonIcon color={"primary"} icon={arrowBackOutline}></IonIcon>
                                        </IonRouterLink>
                                    </IonChip>
                                    <IonList>
                                        <IonSelect aria-label={'option-chart'}
                                                   value={option}
                                                   onIonChange={onOptionChange}
                                                   interface="popover" placeholder="Select Chart">
                                            {
                                                Object.keys(ChartTypeEnum).filter(x => !isNaN(+x)).map((item, index) =>
                                                    <IonSelectOption
                                                        key={index}
                                                        disabled={item == option?.toString()}
                                                        value={+item as ChartTypeEnum}>
                                                        {ChartConstant[+item as ChartTypeEnum]}
                                                    </IonSelectOption>)
                                            }
                                        </IonSelect>
                                    </IonList>
                                    <IonToggle onIonChange={(e) => setRealtimeMode(e.detail.checked)}
                                               checked={realtimeMode} className={'ml-5'} enableOnOffLabels={true}>Realtime
                                        mode</IonToggle>
                                </div>
                                {/*<p className={"text-lg text-grey-700"}> {label}</p>*/}
                            </div>
                        </IonCardHeader>
                        <IonCardContent>
                            {
                                loading ? <IonSkeletonText className={'h-[300px] rounded-md'}
                                                           animated={true}></IonSkeletonText>
                                    :
                                    config &&
                                    <Chart options={config?.options} type={'line'} height={300}
                                           series={config?.series}/>
                            }
                        </IonCardContent>
                    </IonCard>
                </IonCol>
            </IonRow>
        </IonGrid>
    )
}
