import {UiChart, UiChartProp} from "../UiChart";
import React, {useEffect, useState} from "react";
import {IonCol, IonGrid, IonRow} from "@ionic/react";
import {WeatherCard} from "../WeatherCard";
import {ChartConstant} from "../../shared/constant";
import {ChartTypeEnum, Sensor} from "../../shared";
import {barcodeOutline, pin, sunnyOutline} from "ionicons/icons";
import {DataSnapshot, onValue, ref} from "firebase/database";
import {database} from "../../database";


export const ListChart = () => {

    const dataCharts: UiChartProp[] = [
        {
            title: ChartConstant[ChartTypeEnum.Temperature],
            type: 'radialBar',
            value: [30],
            label: ChartConstant[ChartTypeEnum.Temperature],
            formatter(val: number): string {
                return `${val} .C`;
            },
            slug: ChartTypeEnum.Temperature,
            icon: pin
        },
        {
            title: ChartConstant[ChartTypeEnum.Soil],
            type: 'radialBar',
            value: [85],
            label: ChartConstant[ChartTypeEnum.Soil],
            formatter(val: number): string {
                return `${val}%`;
            },
            slug: ChartTypeEnum.Soil,
            icon: barcodeOutline
        },
        {
            title: ChartConstant[ChartTypeEnum.Light],
            type: 'radialBar',
            value: [75],
            label: ChartConstant[ChartTypeEnum.Light],
            maxValue: 100,
            slug: ChartTypeEnum.Light,
            formatter(val: number): string {
                return `${val}%`;
            },
            icon: sunnyOutline
        }
    ];

    const [data, setData] = useState<UiChartProp[]>(dataCharts);

    useEffect(() => {
        onValue(ref(database, '/actValues/sensors'), (snapshot: DataSnapshot) => {
            const actSensors: Sensor = snapshot.val();
            setData(prev =>{
                const data =[...prev];
                data[0].value = [actSensors.temperature];
                data[1].value = [actSensors.soil];
                data[2].value = [actSensors.light];
                return data;
            })
        }, {
            onlyOnce: false
        });
    }, []);

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
