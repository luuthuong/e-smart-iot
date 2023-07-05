import {UiChart, UiChartProp} from "../UiChart";
import React, {useEffect} from "react";
import {IonCol, IonGrid, IonRow} from "@ionic/react";
import {WeatherCard} from "../WeatherCard";


export const ListChart = ({ data = [] }: { data: UiChartProp[] }) => {
    return <IonGrid>
        <IonRow>
            {
                data.length &&
                data.map((x, index) => (
                    <IonCol
                        key={index}
                        size={'12'}  sizeSm={'6'} sizeLg={'6'} sizeXl={'3'}
                    >
                        <UiChart {...x}/>
                    </IonCol>
                ))
            }
            <IonCol
                size={'12'}  sizeSm={'6'} sizeLg={'6'}  sizeXl={'3'}
            >
                <WeatherCard/>
            </IonCol>
        </IonRow>
    </IonGrid>
}
