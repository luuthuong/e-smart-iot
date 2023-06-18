import {
    IonAlert,
    IonButton, IonCard, IonCardContent,
    IonCol, IonContent, IonGrid,
    IonHeader, IonInput,
    IonPage,
    IonRouterLink,
    IonRow,
    IonTitle,
    IonToolbar, useIonRouter
} from "@ionic/react";
import React, {useEffect, useState} from "react";
import {Logo} from "../../data/svg-control";

const SignIn = () => {

    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [message] = useState<string>("Error");
    // const [lengthPassword, setLengthPassword] = useState<number>(0);

    useEffect(() => {

    }, []);
    const router = useIonRouter();
    const onSignIn = () => {
        router.push("/home","forward");
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
            <IonContent fullscreen className={"bg-content ion-padding ion-text-center"}>
                <IonCard className={"max-w-screen-md m-auto"} >
                    <IonAlert
                        isOpen={error}
                        onDidDismiss={() => setError(false)}
                        header={"Error!"}
                        message={message}
                        buttons={["Cancel"]}
                    >
                    </IonAlert>
                    <IonCardContent>
                        <IonGrid>
                            <IonRow>
                                <IonCol className={"mx-auto"} size={'auto'}>
                                    <Logo size={64}/>
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
                                        Dont have any account?
                                        <IonRouterLink routerLink={"/sign-up"} color={"danger"} className={""}>Sign
                                            Up</IonRouterLink>
                                    </p>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    )
};

export default SignIn;
