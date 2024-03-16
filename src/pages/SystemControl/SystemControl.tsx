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
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import { ChartDetail, ControlPanel, ListChart } from "../../components";
import { Logo } from "../../data/svg-control";
import History from "../History/History";
import { Redirect, Route, useHistory, useLocation } from "react-router-dom";
import { Report } from "../Reporter/Report";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../database";
import {PredictVisualization} from "../PredictVisualization/PredictVisualization";

const SystemControl = () => {
  const [back, setBack] = useState(false);
  const [backAction, setBackAction] = useState<
    "/report" | "/history" | undefined
  >(undefined);
  const router = useIonRouter();

  const location = useLocation();
  const history = useHistory();

  const [actionHeader, setActionHeaders] = useState<
    ("report" | "history" | "login")[]
  >([]);

  const [present] = useIonToast();
  const presentToast = (
    msg: string,
    color: string,
    position: "top" | "middle" | "bottom" = "bottom"
  ) => {
    present({
      message: msg,
      duration: 2000,
      position: position,
      color: color,
    });
  };

  useEffect(() => {
    onAuthStateChanged(auth, (usr) => {
      if (usr) {
        // console.log(usr.uid)
        return;
      }
      presentToast("unauthorize user. Login again!", "danger", "top");
      history.push("/sign-in");
    });
  }, []);

  useEffect(() => {
    setBackAction(location.pathname as "/report" | "/history" | undefined);
  }, [location]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className={"ion-text-left"}>
          <IonTitle size={"large"} className={"ion-align-items-center"}>
            <IonText
              color={"dark"}
              className={"ion-margin flex gap-1 items-center"}
            >
              <Logo />
              <span
                className={
                  "ion-hide-sm-down text-2xl text-gray-500 font-semibold"
                }
              >
                E-Smart IOT
              </span>
            </IonText>
          </IonTitle>
          <IonButtons className={"ion-margin"} slot={"primary"}>
            <IonRouterLink routerLink={"/predict-visualize"}>
              <IonButton fill={'outline'} color={'tertiary'} className={'text-black'}>
                Predict Visualize
              </IonButton>
            </IonRouterLink>
            <IonRouterLink
              routerLink={backAction === "/report" ? "/system" : "/report"}
            >
              <IonButton color={"dark"} fill={"solid"}>
                {backAction === "/report" ? "Back" : "Report"}
              </IonButton>
            </IonRouterLink>

            <IonRouterLink
              onClick={(evt) => evt.stopPropagation()}
              routerLink={backAction === "/history" ? "/system" : "/history"}
            >
              <IonButton
                color={backAction === "/history" ? "dark" : "warning"}
                fill={"solid"}
              >
                {backAction === "/history" ? "Back" : "History"}
              </IonButton>
            </IonRouterLink>
            <IonButton
              className={"text-white"}
              color={"danger"}
              fill={"solid"}
            >
              <IonRouterLink className={'text-white'} routerLink={"/sign-in"}>Logout</IonRouterLink>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className={"relative"}>
          <IonRouterOutlet className={"relative"}>
            <Route>
              <Redirect to={"/system"} />
            </Route>
            <Route path={"/system"}>
              <HomeRouterOutlet />
            </Route>
            <Route path={"/history"} exact={true}>
              <History />
            </Route>
            <Route component={Report} path={"/report"} exact />
            <Route component={PredictVisualization} path={'/predict-visualize'} exact={true}/>
          </IonRouterOutlet>
        </div>
      </IonContent>
      <IonFooter>{/*Footer*/}</IonFooter>
    </IonPage>
  );
};

const HomeRouterOutlet = () => {
  return (
    <>
      <div className={"relative home-control-outlet"}>
        <IonRouterOutlet className={"relative"}>
          <Route path={"/system"} exact={true}>
            <ListChart />
          </Route>
          <Route path={"/system/chart/:id"}>
            <ChartDetail></ChartDetail>
          </Route>
        </IonRouterOutlet>
      </div>
      <div>
        <ControlPanel />
      </div>
    </>
  );
};

export default SystemControl;
