import {
    IonAlert,
    IonButton,
    IonCol, IonContent, IonGrid,
    IonHeader, IonIcon, IonInput,
    IonPage,
    IonRouterLink,
    IonRow,
    IonTitle,
    IonToolbar
} from "@ionic/react";
import React, {useEffect, useState} from "react";
import {personCircle} from "ionicons/icons";

const SignIn = () => {

    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [message, setMessage] = useState<string>("Error");
    const [lengthPassword, setLengthPassword] = useState<number>(0);

    useEffect(() => {

    }, []);

    const onSignIn = () => {
        console.log('login')
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>
                        Login
                    </IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className={"ion-padding ion-text-center"}>
                <IonGrid>
                    <IonRow>
                        <IonCol>
                            <IonAlert
                                isOpen={error}
                                onDidDismiss={() => setError(false)}
                                header={"Error!"}
                                message={message}
                                buttons={["Cancel"]}
                            >
                            </IonAlert>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol>
                            <IonIcon
                                style={{
                                    fontSize: "70px",
                                    color: "#0040ff"
                                }}
                                icon={personCircle}
                            >
                            </IonIcon>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonInput
                            label={"User name"}
                            labelPlacement={"floating"}
                            type={"text"} value={userName}
                            fill={"outline"}
                            onIonChange={e => setUserName(e.detail.value!)}
                            placeholder={"User name"}
                            counter={true}
                        >
                        </IonInput>

                    </IonRow>
                    <IonRow>
                        <IonInput
                            className={"ion-margin-top"}
                            label={"Password"}
                            labelPlacement={"floating"}
                            type={"text"}
                            value={password}
                            fill={"outline"}
                            onIonChange={e => setPassword(e.detail.value!)}
                            placeholder={"Password"}
                            counter={true}
                        >
                        </IonInput>
                    </IonRow>
                    <IonRow>
                        <IonCol>
                            <IonButton color={"danger"} onClick={onSignIn}>
                                Sign In
                            </IonButton>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol>
                            <p>
                                Don't have any account?
                                <IonRouterLink routerLink={"/sign-up"} color={"danger"} className={""}>Sign
                                    Up</IonRouterLink>
                            </p>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonPage>
    )
};

export default SignIn;
