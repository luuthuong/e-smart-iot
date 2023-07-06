import {
    IonBackdrop,
    IonButton, IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonChip, IonCol, IonContent, IonGrid,
    IonHeader,
    IonIcon, IonInput, IonItem, IonLabel, IonModal, IonRow, IonText, IonTitle, IonToolbar, useIonToast,
} from "@ionic/react";
import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import Chart from "react-apexcharts";
import * as ReactApexChartProps from "react-apexcharts";
import {arrowForward, createOutline} from 'ionicons/icons'
import {Link} from "react-router-dom";
import {ChartConfig, ChartLimit, ChartTypeEnum, initChartConfig, Limit, LimitSensor} from "../../shared";
import {onValue, ref, set} from "firebase/database";
import {database} from "../../database";
import {BackDropContext} from "../../shared/context";
import './ui-chart.css';
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import {Color} from "@ionic/cli/lib/utils/color";
export type UiChartProp = ChartConfig &  {
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
    const modalConfigLimit = useRef<HTMLIonModalElement>(null);
    const [activeModal, setActiveModal] = useState(false);
    const iHigh = useRef<HTMLIonInputElement>(null);
    const iLow = useRef<HTMLIonInputElement>(null);

    const [present] = useIonToast();
    const presentToast = (msg: string ,color: string, position: 'top' | 'middle' | 'bottom' = 'bottom' ) => {
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
            minValue: props.minValue
        }
        setConfig(initChartConfig(config));
        const limitPath = 'settings/limits';

        onValue(ref(database, getLimit(slug!)),(snapshot) =>{
            const response: Limit = snapshot.val();
            setLimit(response);
        });
    }, [value]);

    const inValidInput = (...params: Limit[]) =>{
        return params.some(x => [x.low,x.high].some(x1 => +x1 < 0 || isNaN(x1)) || +x.high < +x.low );
    }

    const onSaveLimit = (evt: CustomEvent<OverlayEventDetail>) =>{
        const {role, data} = evt.detail;
        if(role === 'confirm'){
            if(inValidInput(data)){
                presentToast('Input data invalid, please check again!', 'danger');
                return;
            }
            set(ref(database, getLimit(slug!)),data).then(res =>{
                presentToast('Success', 'success');
            });
        }
    }

    const confirm = () =>{
        if([iHigh, iLow].some(x => !x || !x.current))
            return;
        modalConfigLimit?.current?.dismiss({
            high: iHigh?.current?.value,
            low: iLow?.current?.value
        } as Limit, 'confirm');
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
                  <IonModal  ref={modalConfigLimit} trigger={slug?.toString() || ''} onWillDismiss={onSaveLimit}>
                      <IonHeader>
                          <IonToolbar>
                              <IonButtons slot="start">
                                  <IonButton onClick={() => modalConfigLimit.current?.dismiss()}>Cancel</IonButton>
                              </IonButtons>
                              <IonTitle>{title}</IonTitle>
                              <IonButtons slot="end">
                                  <IonButton onClick={confirm} strong={true} >
                                      Save
                                  </IonButton>
                              </IonButtons>
                          </IonToolbar>
                      </IonHeader>
                      <IonContent className="ion-padding h-[200px]">
                          <IonItem>
                              <IonLabel position="stacked">High Limit</IonLabel>
                              <IonInput ref={iHigh} type="number" placeholder="HIGH" />
                          </IonItem>
                          <IonItem>
                              <IonLabel position="stacked">Low Limit</IonLabel>
                              <IonInput ref={iLow} type="number" placeholder="HIGH" />
                          </IonItem>
                      </IonContent>
                  </IonModal>

                  <IonItem>
                      <IonGrid>
                          <IonRow>
                              <IonCol sizeSm={'6'} sizeMd={'4'} className={'flex justify-start items-center gap-x-0.5'}>
                                  <IonText className={'text-sm'}>H</IonText>
                                  <IonChip disabled color={'dark'}>
                                      {limit.high}
                                  </IonChip>
                              </IonCol>
                              <IonCol sizeSm={'6'} sizeMd={'4'}  className={'flex justify-start items-center gap-x-0.5'}>
                                  <IonText className={'text-sm'}>L</IonText>
                                  <IonChip disabled color={'dark'}>
                                      {limit.low}
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
      </>
    )
}

export default UiChart;
