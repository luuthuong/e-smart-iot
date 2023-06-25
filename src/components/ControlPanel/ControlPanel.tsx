import React from "react";
import {Lamp, Motor, Pump} from "../../data/svg-control";
import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCol,
    IonGrid, IonItemDivider,
    IonLabel,
    IonRow,
    IonToggle
} from "@ionic/react";

export const ControlPanel = () => {
    return (
        <IonGrid>
            <IonRow>
                <IonCol size={'12'} className={'mx-auto'} sizeLg={'8'}>
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle className={'ion-text-center'}>
                                Control Panel
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonGrid>
                                <IonRow>
                                    <IonCol className={'flex flex-col justify-center items-center'} size={'4'}>
                                        <Pump/>
                                        <IonToggle className={'mt-1'} color={'medium'} enableOnOffLabels={true}></IonToggle>
                                    </IonCol>
                                    <IonCol className={'flex  flex-col justify-center items-center'} size={'4'}>
                                        <Lamp/>
                                        <IonToggle className={'mt-1'} color={'medium'} enableOnOffLabels={true}></IonToggle>
                                    </IonCol>
                                    <IonCol className={'flex  flex-col justify-center items-center'} size={'4'}>
                                        <Motor/>
                                        <IonToggle className={'mt-1'} color={'medium'} enableOnOffLabels={true}></IonToggle>
                                    </IonCol>
                                </IonRow>
                                <IonItemDivider></IonItemDivider>
                                <IonRow>
                                    <IonCol size={'auto'} className={'mx-auto'}>
                                        <IonToggle color={'dark'} checked={true}>
                                            <IonLabel>Manual</IonLabel>
                                        </IonToggle>
                                    </IonCol>
                                </IonRow>
                            </IonGrid>
                        </IonCardContent>
                    </IonCard>
                </IonCol>
            </IonRow>
        </IonGrid>
    )
}
