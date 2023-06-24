import React, {useEffect, useState} from "react";
import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonChip,
    IonCol, IonDatetime, IonDatetimeButton,
    IonGrid,
    IonIcon, IonList, IonModal, IonRefresher, IonRefresherContent,
    IonRow, IonSelect, IonSelectOption, RefresherEventDetail, SelectChangeEventDetail
} from "@ionic/react";
import {arrowBackOutline} from "ionicons/icons";
import Chart from "react-apexcharts";
import {ChartTypeEnum, initChartConfig} from "../../shared";
import * as ReactApexChartProps from "react-apexcharts";
import {Link, useHistory, useParams} from "react-router-dom";
import {ChartConstant} from "../../shared/constant";
import {IonSelectCustomEvent} from "@ionic/core/dist/types/components";

// export type ChartDetailProps = {}
export const ChartDetail = () => {
    const [config, setConfig] = useState<ReactApexChartProps.Props>();
    const [label, setLabel] = useState("");
    const [option, setOption] = useState<ChartTypeEnum>();
    const router = useHistory();
    const params = useParams() as { id: string };

    useEffect(() =>{
        if (!params?.id)
            return;
        setLabel(ChartConstant[+params.id as ChartTypeEnum]);
        setOption(+params.id as ChartTypeEnum);
    }, []);

    useEffect(() => {
        const temp =  [30, 40, 45, 50, 49, 60, 70, 91]
        const soil =  [23, 33, 1, 77, 44, 23, 12, 91]
        const light =  [19, 40, 45, 20, 99, 64, 72, 100]

        const data= [temp,soil, light]

        setConfig(initChartConfig({
            type: 'line',
            label: 'Chart',
            maxValue: 100,
            formatter(val: number): string {
                return `${val}%`;
            },
            seriesOption: [
                {
                    name: 'data',
                    data: data[+params.id]
                }
            ],
            xAxisData: [22, 1992, 1993, 1994, 1995, 1996, 1997, 1998]
        }));
    }, [option]);

    const handleRefresh =
        // eslint-disable-next-line no-undef
        (event: CustomEvent<RefresherEventDetail>) => {
            setTimeout(() => {
                console.log('on refresh')
                event.detail.complete();
            }, 1000);
        };

    const onOptionChange = (e: IonSelectCustomEvent<SelectChangeEventDetail<ChartTypeEnum>>) => {
        router.push(`/home/chart/${e.detail.value}`);
        setOption(e.detail.value);
        setLabel(ChartConstant[e.detail.value as ChartTypeEnum]);
    }

    return <IonGrid>
        <IonRow>
            <IonCol className={'mx-auto'} size={'10'} sizeMd={'4'} sizeLg={'6'} sizeXl={'4'}>
                <IonRow>
                    <IonCol className={'flex gap-x-1 justify-center'} size={'12'} sizeMd={'12'} sizeLg={'6'}>
                        <span
                            className={'text-xl font-medium text-gray-800 flex items-center justify-center h-full w-[50px]'}>From</span>
                        <IonModal keepContentsMounted={true}>
                            <IonDatetime presentation={'date'} id="dateFrom"></IonDatetime>
                        </IonModal>
                        <IonDatetimeButton datetime="dateFrom"></IonDatetimeButton>
                    </IonCol>

                    <IonCol className={'flex gap-x-1 mx-auto justify-center'} size={'12'} sizeMd={'12'} sizeLg={'6'}>
                        <span
                            className={'text-xl font-medium text-gray-800 flex items-center justify-center h-full w-[50px]'}>
                            To
                        </span>
                        <IonDatetimeButton datetime="dateTo"></IonDatetimeButton>
                        <IonModal keepContentsMounted={true}>
                            <IonDatetime presentation={'date'} id="dateTo"></IonDatetime>
                        </IonModal>
                    </IonCol>
                </IonRow>
            </IonCol>
        </IonRow>

        <IonRow>
            <IonCol size={'auto'}>

            </IonCol>
        </IonRow>

        <IonRow>
            <IonCol>
                <IonRefresher slot="fixed" pullFactor={0.5} pullMin={100} pullMax={200} onIonRefresh={handleRefresh}>
                    <IonRefresherContent pullingIcon="chevron-down-circle-outline"
                                         pullingText="Pull to refresh"
                                         refreshingSpinner="circles"
                                         refreshingText="Refreshing...">
                    </IonRefresherContent>
                </IonRefresher>

                <IonCard>
                    <IonCardHeader>

                        <div className={'flex ion-justify-content-between ion-align-items-center'}>
                            <div className={'flex items-center gap-x-1'}>
                                <Link to={"/home"}>
                                    <IonChip color={"light"} className={"w-fit flex justify-center"}>
                                        <IonIcon color={"primary"} icon={arrowBackOutline}></IonIcon>
                                    </IonChip>
                                </Link>
                                <IonList>
                                    <IonSelect aria-label={'option-chart'}
                                               value={option}
                                               onIonChange={onOptionChange}
                                               interface="popover" placeholder="Select Chart">
                                        {
                                            Object.keys(ChartTypeEnum).filter(x => !isNaN(+x)).map((item, index) => <IonSelectOption
                                                key={index}
                                                disabled={item == option?.toString()}
                                                value={+item as ChartTypeEnum}>
                                                {ChartConstant[+item as ChartTypeEnum]}
                                            </IonSelectOption>)
                                        }
                                    </IonSelect>
                                </IonList>
                            </div>
                            <p className={"text-lg text-grey-700"}> {label}</p>
                        </div>
                    </IonCardHeader>
                    <IonCardContent>
                        {
                            config &&
                            <Chart options={config?.options} type={'line'} height={300} series={config?.series}/>
                        }
                    </IonCardContent>
                </IonCard>
            </IonCol>
        </IonRow>
    </IonGrid>
}
