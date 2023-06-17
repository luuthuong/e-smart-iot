import {
    IonButton, IonButtons, IonContent,
    IonFooter, IonHeader, IonPage, IonRouterOutlet, IonText, IonTitle,
    IonToolbar
} from "@ionic/react";
import {Logo} from "../../data/svg-control";
import React from "react";
import {Link} from "react-router-dom";
import {ListChart} from "../../components/ListChart";
import {UiChartProp} from "../../components/UiChart";
import {Redirect, Route} from "react-router";
import {ChartDetail} from "../../components/ChartDetail";

const SystemControl = () => {

    const dataCharts: UiChartProp[] = [
        {
            title: "Temperature",
            value: 30,
            label: 'Temperature',
            formatter(val: number): string {
                return `${val}%`;
            }
        },
        {
            title: "Soil",
            value: 85,
            label: 'Soil',
            formatter(val: number): string {
                return `${val}%`;
            }
        },
        {
            title: "Soil",
            value: 750,
            label: 'Light',
            maxValue: 1000
        },
    ]

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
            <div className={'h-[50vh]'}>
                <IonRouterOutlet>
                    <Route path={""}>
                        <Redirect to={'/home/system'}/>
                    </Route>
                    <Route path={"/home/system"} exact={true}>
                        <ListChart data={dataCharts}/>
                    </Route>
                    <Route path={"/home/system/chart/:id"}>
                        <ChartDetail></ChartDetail>
                    </Route>
                </IonRouterOutlet>
            </div>
            <div>
                asdasd
            </div>
        </IonContent>

        <IonFooter>
            Footer
        </IonFooter>
    </IonPage>;
}

export default SystemControl;
