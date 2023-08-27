import {IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonModal, IonToolbar} from "@ionic/react";
import {DateRange, Range} from "react-date-range";
import React, {useRef, useState} from "react";
import {todayOutline} from "ionicons/icons";

export type DateRangeModalProps = {
    close?(data: Range[]): void;
    confirm?(data: Range[]): void;
}
export const DateRangeModal = ({close, confirm}:DateRangeModalProps) =>{
    const modal = useRef<HTMLIonModalElement>(null);
    const [date, setDate] = useState<Range[]>([
        {
            startDate: new Date(),
            endDate: undefined,
            key: 'selection'
        }
    ]);

    return <>
        <IonButton color={'light'}  id="open-modal">
            Select Date
            <IonIcon className={'ml-1'} icon={todayOutline}></IonIcon>
        </IonButton>
        <IonModal
            ref={modal}
            keepContentsMounted={true}
            trigger="open-modal"
            onWillDismiss={(evt) =>{
                if(evt.detail.role === 'ok') {
                    if(confirm)
                        confirm(evt.detail.data);
                }

                if(evt.detail.role === 'cancel') {
                    if(close)
                        close(evt.detail.data);
                }
            }}
        >
            <IonHeader>
                <IonToolbar>
                    <IonButtons>
                        <IonButton onClick={() =>{
                            modal.current?.dismiss(date, 'cancel');
                        }}>Cancel</IonButton>
                    </IonButtons>

                    <IonButtons slot="end">
                        <IonButton strong={true} onClick={() =>{
                            modal.current?.dismiss(date, 'ok');
                        }}>
                            OK
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <DateRange
                    className={'w-full'}
                    editableDateInputs={true}
                    onChange={item => setDate([item.selection])}
                    moveRangeOnFirstSelection={false}
                    ranges={date}
                />
            </IonContent>
        </IonModal>
    </>
}