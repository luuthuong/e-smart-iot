import {DeviceType} from "../../shared";
import React from "react";
import {IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonChip, IonIcon, IonLabel} from "@ionic/react";
import {Cloudy, Rain} from "../../data/svg-control";
import {cloudyOutline} from "ionicons/icons";

export type WeatherCardProps = DeviceType;
export const WeatherCard = ({active}: WeatherCardProps) =>{
    return<IonCard>
        <IonCardHeader>
            <IonCardTitle>
                <IonChip color={'dark'} >
                   <IonIcon icon={cloudyOutline} color="primary"></IonIcon>
                    <IonLabel className={'text-grey-700 text-lg text-grey-700'}>Weather</IonLabel>
                </IonChip>
            </IonCardTitle>
        </IonCardHeader>
        <IonCardContent className={'h-[300px] flex justify-center items-center'}>
            {
                active ?  <Rain/> : <Cloudy/>
            }
        </IonCardContent>
    </IonCard>
}
