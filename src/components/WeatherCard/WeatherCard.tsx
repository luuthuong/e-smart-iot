import {DeviceType} from "../../shared";
import React, {useEffect, useState} from "react";
import {IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonChip, IonIcon, IonLabel} from "@ionic/react";
import {Cloudy, Rain} from "../../data/svg-control";
import {cloudyOutline} from "ionicons/icons";
import {onValue, ref} from "firebase/database";
import {database} from "../../database";

export const WeatherCard = () =>{
    const [active, setActive] = useState(false);
    useEffect(() =>{
        onValue(ref(database, 'actValues/sensors/rain'),(snapshot) =>{
            setActive(snapshot.val());
        });
    },[]);
    return<IonCard>
        <IonCardHeader>
            <IonCardTitle>
                <IonChip color={'dark'} >
                   <IonIcon icon={cloudyOutline} color="primary"></IonIcon>
                    <IonLabel className={'text-grey-700 text-lg text-grey-700'}>Weather</IonLabel>
                </IonChip>
            </IonCardTitle>
        </IonCardHeader>
        <IonCardContent className={'h-[350px] md:h-[300px] flex justify-center items-center'}>
            {
                active ?  <Rain/> : <Cloudy/>
            }
        </IonCardContent>
    </IonCard>
}
