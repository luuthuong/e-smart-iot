import {IonBackButton, IonContent, IonFooter, IonHeader, IonPage, IonTitle, IonToolbar} from "@ionic/react";
import {Button} from "@mui/material";
import {Lamp, Logo, Motor} from "../../data/svg-control";
import React from "react";

const SystemControl = () =>
    <IonPage>
        <IonHeader>
            <IonToolbar className={"ion-text-left"}>
                <IonTitle className={'ion-hide-md-down'}>
                    E-Smart IOT
                </IonTitle>
                <IonBackButton className={"w-fit ion-hide-md-up"} text={"Home"} defaultHref={"/home"}>
                </IonBackButton>
            </IonToolbar>
        </IonHeader>
        <IonContent>
            Content
            <Motor></Motor>
            <Lamp/>
            <Logo/>
            <Button variant="text">Text</Button>
            <Button variant="contained">Contained</Button>
            <Button variant="outlined">Outlined</Button>
        </IonContent>

        <IonFooter>
            Footer
        </IonFooter>
    </IonPage>

export default SystemControl;
