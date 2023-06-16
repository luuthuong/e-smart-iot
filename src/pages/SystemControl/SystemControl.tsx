import {
    IonButton, IonButtons,
    IonContent,
    IonFooter,
    IonHeader, IonPage, IonText, IonTitle,
    IonToolbar
} from "@ionic/react";
import {Button} from "@mui/material";
import {Lamp, Logo, Motor} from "../../data/svg-control";
import React from "react";
import {Link} from "react-router-dom";

const SystemControl = () =>
    <IonPage>
        <IonHeader>
            <IonToolbar className={"ion-text-left"}>
                <IonTitle  size={"large"} className={"ion-align-items-center"}>
                    <IonText color={"dark"}  className={"ion-margin flex gap-1 items-center"}>
                        <Logo/>
                        <span className={"text-2xl text-gray-500 font-semibold"}>
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
            Content
        </IonContent>

        <IonFooter>
            Footer
        </IonFooter>
    </IonPage>

export default SystemControl;
