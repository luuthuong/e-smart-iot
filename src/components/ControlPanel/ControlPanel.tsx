import React, {useEffect, useRef, useState} from "react";
import {Lamp, Motor, Pump} from "../../data/svg-control";
import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCol,
    IonGrid, IonItemDivider,
    IonLabel,
    IonRow, IonToggle, ToggleChangeEventDetail
} from "@ionic/react";
import { IonToggleCustomEvent } from "@ionic/core";
import {onValue, ref, set} from "firebase/database";
import {database} from "../../database";

export const ControlPanel = () => {
    const controller = 'settings/manualController';
    const settingMode = 'settings/mode';
    const toggleRefs = useRef<(HTMLIonToggleElement | null)[]>([]);
    const [textMode, setTextMode] = useState<'Auto' | 'Manual'>('Auto');
    const observableDeviceChange = ( path: string, refIonToggle: HTMLIonToggleElement | null, callback?: (val: boolean) => void) =>{
        onValue(ref(database, `settings/${path}`), (snapshot) =>{
            if(refIonToggle)
                refIonToggle.checked = snapshot.val();
            if(callback)
                callback(snapshot.val());
        });
    }
    useEffect(() =>{
        observableDeviceChange('manualController/pump', toggleRefs.current[0]);
        observableDeviceChange('manualController/lamp', toggleRefs.current[1]);
        observableDeviceChange('manualController/motor', toggleRefs.current[2]);
        observableDeviceChange('mode', toggleRefs.current[3], (val) =>{
            setTextMode(val ? 'Auto' : 'Manual');
        });
    }, []);

    const onTriggerDevice = (evt: IonToggleCustomEvent<ToggleChangeEventDetail<any>>) =>{
        const {value: path , checked} = evt.detail;
        set(ref(database, path), checked).then(() =>{
        });
    }

    return (
        <IonGrid>
            <IonRow>
                <IonCol size={'12'} className={'mx-auto'} sizeLg={'8'}>
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle className={'ion-text-center text-3xl font-semibold text-gray-500'}>
                                Control Panel
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonGrid>
                                <IonRow>
                                    <IonCol className={'flex flex-col justify-center items-center'} size={'4'}>
                                        <IonLabel className={'text-lg font-semibold'}>Pump</IonLabel>
                                        <Pump/>
                                        <IonToggle ref={x => toggleRefs.current[0] = x} value={`${controller}/pump`} onIonChange={onTriggerDevice} className={'mt-1'} color={'medium'} enableOnOffLabels={true}></IonToggle>
                                    </IonCol>
                                    <IonCol className={'flex  flex-col justify-center items-center'} size={'4'}>
                                        <IonLabel className={'text-lg font-semibold'}>Lamp</IonLabel>
                                        <Lamp/>
                                        <IonToggle ref={x => toggleRefs.current[1] = x}  value={`${controller}/lamp`} onIonChange={onTriggerDevice} className={'mt-1'} color={'medium'} enableOnOffLabels={true}></IonToggle>
                                    </IonCol>
                                    <IonCol className={'flex  flex-col justify-center items-center'} size={'4'}>
                                        <IonLabel className={'text-lg font-semibold'}>Motor</IonLabel>
                                        <Motor/>
                                        <IonToggle ref={x => toggleRefs.current[2] = x}  value={`${controller}/motor`} onIonChange={onTriggerDevice} className={'mt-1'} color={'medium'} enableOnOffLabels={true}></IonToggle>
                                    </IonCol>
                                </IonRow>
                                <IonRow className={'mt-4'}>
                                    <IonCol size={'auto'} className={'mx-auto'}>
                                        <IonToggle ref={x => toggleRefs.current[3] = x} value={settingMode} onIonChange={onTriggerDevice} color={'dark'} >
                                            <IonLabel className={'w-[50px] block font-medium'}>{textMode}</IonLabel>
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
