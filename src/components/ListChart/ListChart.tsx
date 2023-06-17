import {UiChart, UiChartProp} from "../UiChart";
import React from "react";
import {IonCol, IonGrid, IonRow} from "@ionic/react";


export const ListChart = ({
                              data = []
                          }: { data: UiChartProp[] }) => {

    return <IonGrid>
        <IonRow>
            {
                data.length &&
                data.map((x, index) => (
                    <IonCol
                        key={index}
                        size={'12'} sizeLg={'4'} sizeMd={ '6'}
                    >
                        <UiChart {...x}/>
                    </IonCol>
                ))
            }
        </IonRow>
    </IonGrid>
}
