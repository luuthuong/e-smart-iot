import {
    IonButton,
    IonButtons,
    IonContent,
    IonFooter,
    IonHeader,
    IonPage,
    IonRouterLink,
    IonRouterOutlet,
    IonText,
    IonTitle,
    IonToolbar,
    useIonRouter
} from "@ionic/react";
import React, {useEffect, useState} from "react";
import {ChartDetail, ControlPanel, ListChart} from "../../components";
import {Logo} from "../../data/svg-control";
import History from "../History/History";
import {Redirect, Route, useLocation} from "react-router-dom";
import {Report} from "../Reporter/Report";

const SystemControl = () => {
    const [back, setBack] = useState(false);
    const [backAction, setBackAction] = useState<'/report' | '/history' | undefined>(undefined);
    const router = useIonRouter();

    const location = useLocation();

    const [actionHeader, setActionHeaders] = useState<('report' | 'history' | 'login')[]>([])

    useEffect(() => {
        setBackAction(location.pathname as ('/report' | '/history' | undefined));
    }, [location]);

    // useEffect(() => {
    //     if (['/history', '/report'].includes(router.routeInfo.pathname)) {
    //         setBack(true);
    //         return;
    //     }
    //     setBack(false);
    // }, [router]);

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
                    <IonRouterLink routerLink={ backAction === '/report' ? '/system': '/report'}>
                        <IonButton color={"dark"} fill={"solid"}>
                            {backAction === '/report' ? 'Back' : 'Report'}
                        </IonButton>
                    </IonRouterLink>

                    <IonRouterLink onClick={evt => evt.stopPropagation()}  routerLink={backAction === '/history' ? "/system" : '/history'}>
                        <IonButton color={backAction === '/history'  ? "dark" :"warning"} fill={"solid"}>
                            {backAction === '/history' ? 'Back' : 'History'}
                        </IonButton>
                    </IonRouterLink>
                    <IonButton color={"medium"} fill={"solid"}>
                        <IonRouterLink routerLink={"/sign-in"}>
                            Login
                        </IonRouterLink>
                    </IonButton>
                </IonButtons>
            </IonToolbar>
        </IonHeader>

        <IonContent>
            <div className={'relative'}  style={{height: 'calc(100% - 75px)'}}>
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
                    <Route component={Report} path={'/report'} exact />
                </IonRouterOutlet>
            </div>
        </IonContent>
        <IonFooter>
            {/*Footer*/}
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
