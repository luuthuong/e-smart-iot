import {
    IonButton,
    IonButtons,
    IonContent,
    IonFooter,
    IonHeader,
    IonPage,
    IonRouterOutlet,
    IonText,
    IonTitle,
    IonToolbar
} from "@ionic/react";
import {Logo, Rain} from "../../data/svg-control";
import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {ListChart} from "../../components/ListChart";
import {UiChartProp} from "../../components/UiChart";
import {Route} from "react-router";
import {ChartDetail} from "../../components/ChartDetail";
import {ChartTypeEnum} from "../../shared";
import {ChartConstant} from "../../shared/constant";
import Cloudy from "../../data/svg-control/Cloudy";

const SystemControl = () => {

    const dataCharts: UiChartProp[] = [
        {
            title: ChartConstant[ChartTypeEnum.Temperature],
            type: 'radialBar',
            value: [30],
            label: ChartConstant[ChartTypeEnum.Temperature],
            formatter(val: number): string {
                return `${val}%`;
            },
            slug: ChartTypeEnum.Temperature
        },
        {
            title: ChartConstant[ChartTypeEnum.Soil],
            type: 'radialBar',
            value: [85],
            label: ChartConstant[ChartTypeEnum.Soil],
            formatter(val: number): string {
                return `${val}%`;
            },
            slug: ChartTypeEnum.Soil
        },
        {
            title: ChartConstant[ChartTypeEnum.Light],
            type: 'radialBar',
            value: [75],
            label: ChartConstant[ChartTypeEnum.Light],
            maxValue: 100,
            slug: ChartTypeEnum.Light,
            formatter(val: number): string {
                return `${val}%`;
            },
        }
    ];

    const [data] = useState<UiChartProp[]>(dataCharts);

    useEffect(() => {

    },[])

    return <IonPage>
        <IonHeader>
            <IonToolbar className={"ion-text-left"}>
                <IonTitle size={"large"} className={"ion-align-items-center"}>
                    <IonText color={"dark"} className={"ion-margin flex gap-1 items-center"}>
                        <Logo/>
                        <span className={"ion-hide-sm-down text-2xl text-gray-500 font-semibold"}>
                             E-Smart IOT
                        </span>
                    </IonText>
                </IonTitle>
                <IonButtons className={"ion-margin"} slot={"primary"}>
                    <IonButton color={"dark"} fill={"solid"}>
                        Report
                    </IonButton>

                    <IonButton color={"medium"} fill={"solid"}>
                        <Link to={"/sign-in"}>
                            Login
                        </Link>
                    </IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>

        <IonContent>
            <div className={'relative'}>
                <IonRouterOutlet className={'relative'}>
                    <Route path={"/home"} exact={true}>
                        <ListChart data={data}/>
                    </Route>
                    <Route path={"/home/chart/:id"}>
                        <ChartDetail></ChartDetail>
                    </Route>
                </IonRouterOutlet>
            </div>
            <div>
                <Rain/>
                <Cloudy/>
            </div>
        </IonContent>

        <IonFooter>
            Footer
        </IonFooter>
    </IonPage>;
}

export default SystemControl;
