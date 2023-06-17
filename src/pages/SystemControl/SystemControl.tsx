import {
    IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCol,
    IonContent,
    IonFooter, IonGrid,
    IonHeader, IonPage, IonRow, IonText, IonTitle,
    IonToolbar
} from "@ionic/react";
import {Lamp, Logo, Motor} from "../../data/svg-control";
import React from "react";
import {Link} from "react-router-dom";
import Chart from 'react-apexcharts';
import * as ReactApexChartProps from 'react-apexcharts'

const SystemControl = () => {

    const stateChart: ReactApexChartProps.Props = {
        options:{
            chart: {
                type: 'radialBar'
            },
            plotOptions:{
              radialBar:{
                  hollow:{
                      size: '70%'
                  }
              }
            },
            xaxis: {

                categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
            },
            labels: ["Temperature"]
        },
        series:[
          39
        ],
    };
    return <IonPage>
        <IonHeader>
            <IonToolbar className={"ion-text-left"}>
                <IonTitle size={"large"} className={"ion-align-items-center"}>
                    <IonText color={"dark"} className={"ion-margin flex gap-1 items-center"}>
                        <Logo/>
                        <span className={"text-2xl text-gray-500 font-semibold"}>
                             E-Smart IOT
                        </span>
                    </IonText>
                </IonTitle>
                <IonButtons className={"ion-margin"} slot={"primary"}>
                    <IonButton color={"dark"} fill={"solid"}>
                        Report
                    </IonButton>

                    <IonButton color={"medium"} fill={"solid"}>
                        <Link to={"/sign-in"}>
                            Login
                        </Link>
                    </IonButton>

                </IonButtons>
            </IonToolbar>
        </IonHeader>

        <IonContent>
            <IonGrid>
                <IonRow>
                    <IonCol size={'12'} sizeSm={'4'}>
                        <IonCard >
                            <IonCardHeader >
                                Title
                            </IonCardHeader>
                            <IonCardContent>
                                <Chart options={stateChart.options} type={'radialBar'} series={stateChart.series} ></Chart>
                            </IonCardContent>
                        </IonCard>
                    </IonCol>

                    <IonCol size={'12'} sizeSm={'4'}>
                        <IonCard >
                            <IonCardHeader >
                                Title
                            </IonCardHeader>
                            <IonCardContent>
                                <Chart options={stateChart.options} type={'radialBar'} series={stateChart.series} ></Chart>
                            </IonCardContent>
                        </IonCard>
                    </IonCol>

                    <IonCol size={'12'} sizeSm={'4'}>
                        <IonCard>
                            <IonCardHeader >
                                Title
                            </IonCardHeader>

                            <IonCardContent>
                                <Chart options={stateChart.options} type={'radialBar'} series={stateChart.series} ></Chart>
                            </IonCardContent>
                        </IonCard>
                    </IonCol>
                </IonRow>
            </IonGrid>
        </IonContent>

        <IonFooter>
            Footer
        </IonFooter>
    </IonPage>;
}

export default SystemControl;
