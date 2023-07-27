import {
    IonButton,
    IonButtons,
    IonContent,
    IonFooter, IonHeader,
    IonPage,
    IonRouterOutlet,
    IonText,
    IonTitle,
    IonToolbar, useIonRouter
} from "@ionic/react";
import React, {useEffect, useState} from "react";
import {ChartDetail, ControlPanel, ListChart} from "../../components";
import {Redirect, Route} from "react-router";
import {Logo} from "../../data/svg-control";
import {Link} from "react-router-dom";
import History from "../History/History";

const SystemControl = () => {
    const [back, setBack] = useState(false);
    const router = useIonRouter();

    useEffect(() => {
        if (router.routeInfo.pathname === '/history') {
            setBack(true);
            return;
        }
        setBack(false);
        console.log(router)
    }, [router]);

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

                    <Link onClick={evt => evt.stopPropagation()} to={back ? "/" : "/history"}>
                        <IonButton color={back ? "dark" :"warning"} fill={"solid"}>
                            {back ? 'Back' : 'History'}
                        </IonButton>
                    </Link>
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
                    <Route>
                        <Redirect to={'/system'}/>
                    </Route>
                    <Route path={'/system'}>
                        <HomeRouterOutlet/>
                    </Route>
                    <Route path={'/history'} exact={true}>
                        <History/>
                    </Route>
                </IonRouterOutlet>
            </div>
        </IonContent>

        <IonFooter>
            Footer
        </IonFooter>
    </IonPage>
}

const HomeRouterOutlet = () => {
    return <>
        <div className={'relative home-control-outlet'}>
            <IonRouterOutlet className={'relative'}>
                <Route path={"/system"} exact={true}>
                    <ListChart/>
                </Route>
                <Route path={"/system/chart/:id"} >
                    <ChartDetail></ChartDetail>
                </Route>
            </IonRouterOutlet>
        </div>
        <div>
            <ControlPanel/>
        </div>
    </>
}

export default SystemControl;
