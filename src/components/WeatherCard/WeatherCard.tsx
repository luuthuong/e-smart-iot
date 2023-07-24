import React, {useEffect, useState} from "react";
import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonChip,
    IonIcon,
    IonLabel,
    IonSkeletonText
} from "@ionic/react";
import {Cloudy, Rain} from "../../data/svg-control";
import {cloudyOutline} from "ionicons/icons";
import {onValue, ref} from "firebase/database";
import {database} from "../../database";

export const WeatherCard = () =>{
    const [active, setActive] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() =>{
        onValue(ref(database, 'actValues/sensors/rain'),(snapshot) =>{
            setActive(snapshot.val());
            setLoading(false);
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
                loading?
                    <IonSkeletonText className={'w-40 h-40 rounded-full'} animated={true}></IonSkeletonText>
                    : active ?  <Rain/> : <Cloudy/>
            }
        </IonCardContent>
    </IonCard>
}
