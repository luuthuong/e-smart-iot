import React, {useEffect, useRef, useState} from "react";
import {Lamp, Motor, Pump} from "../../data/svg-control";
import {
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCol,
    IonGrid,
    IonLabel,
    IonRow,
    IonToggle,
    ToggleChangeEventDetail
} from "@ionic/react";
import {IonToggleCustomEvent} from "@ionic/core";
import {onValue, ref, set} from "firebase/database";
import {database} from "../../database";
import {Unsubscribe} from "@firebase/database";


export const ControlPanel = () => {
    const controller = 'settings/manualController';
    const settingMode = 'settings/mode';
    const toggleRefs = useRef<(HTMLIonToggleElement | null)[]>([]);
    const [textMode, setTextMode] = useState<'Auto' | 'Manual'>('Auto');
    const observableDeviceChange = ( path: string, refIonToggle: HTMLIonToggleElement | null, callback?: (val: boolean) => void) : Unsubscribe=>{
        return onValue(ref(database, `settings/${path}`), (snapshot) => {
            if (refIonToggle)
                refIonToggle.checked = snapshot.val();
            if (callback)
                callback(snapshot.val());
        });
    }
    useEffect(() =>{
        const destroy: Unsubscribe[] = [];
        destroy.push(observableDeviceChange('manualController/pump', toggleRefs.current[0]));
        destroy.push(observableDeviceChange('manualController/lamp', toggleRefs.current[1]));
        destroy.push(observableDeviceChange('manualController/motor', toggleRefs.current[2]));
        destroy.push(observableDeviceChange('mode', toggleRefs.current[3], (val) =>{
            setTextMode(val ? 'Auto' : 'Manual');
        }));
        return () =>{
            destroy.forEach(item => item())
        }
    }, [textMode]);

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
                                        {
                                            textMode === 'Manual' &&
                                            <IonToggle ref={x => toggleRefs.current[0] = x} value={`${controller}/pump`} onIonChange={onTriggerDevice} className={'mt-1'} color={'medium'} enableOnOffLabels={true}></IonToggle>
                                        }
                                    </IonCol>
                                    <IonCol className={'flex  flex-col justify-center items-center'} size={'4'}>
                                        <IonLabel className={'text-lg font-semibold'}>Lamp</IonLabel>
                                        <Lamp/>
                                        {
                                            textMode === 'Manual' &&
                                            <IonToggle ref={x => toggleRefs.current[1] = x}  value={`${controller}/lamp`} onIonChange={onTriggerDevice} className={'mt-1'} color={'medium'} enableOnOffLabels={true}></IonToggle>
                                        }
                                    </IonCol>
                                    <IonCol className={'flex  flex-col justify-center items-center'} size={'4'}>
                                        <IonLabel className={'text-lg font-semibold'}>Motor</IonLabel>
                                        <Motor/>
                                        {
                                            textMode === 'Manual' &&
                                            <IonToggle ref={x => toggleRefs.current[2] = x}  value={`${controller}/motor`} onIonChange={onTriggerDevice} className={'mt-1'} color={'medium'} enableOnOffLabels={true}></IonToggle>
                                        }
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
