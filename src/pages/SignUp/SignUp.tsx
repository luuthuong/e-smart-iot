import {
    IonAlert, IonButton, IonCard, IonCardContent,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonInput, IonPage, IonRouterLink,
    IonRow,
    IonTitle,
    IonToolbar
} from "@ionic/react";
import './sign-up.css';
import React, {useState} from "react";
import {Logo} from "../../data/svg-control";

const SignUp = () => {

    const [error, setError] = useState(false);
    const [message, setMessage] = useState("");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");

    const onSignUp = () => {
        console.log('sign up')
    }

    return <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonTitle>
                    Register
                </IonTitle>
            </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className={"bg-content ion-padding ion-text-center"}>
            <IonCard className={'max-w-screen-md m-auto'}>
                <IonCardContent className={"glass-theme"}>
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
                                type={"password"}
                                value={password}
                                fill={"outline"}
                                onIonChange={e => setPassword(e.detail.value!)}
                                placeholder={"Password"}
                                counter={true}
                            >
                            </IonInput>
                        </IonRow>
                        <IonRow>
                            <IonInput
                                className={"ion-margin-top"}
                                label={"Repeat Password"}
                                labelPlacement={"floating"}
                                type={"password"}
                                value={rePassword}
                                fill={"outline"}
                                onIonChange={e => setRePassword(e.detail.value!)}
                                placeholder={"Repeat Password"}
                                counter={true}
                            >
                            </IonInput>
                        </IonRow>
                        <IonRow>
                            <IonCol>
                                <IonButton color={"danger"} onClick={onSignUp}>
                                    Sign Up
                                </IonButton>
                            </IonCol>
                        </IonRow>
                        <IonRow>
                            <IonCol>
                                <p>
                                    Have account
                                    <IonRouterLink routerLink={"/sign-in"} color={"danger"} className={""}> Sign
                                        In</IonRouterLink>
                                </p>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </IonCardContent>
            </IonCard>
        </IonContent>
    </IonPage>
}

export default SignUp;
