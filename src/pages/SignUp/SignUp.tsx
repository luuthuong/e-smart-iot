import {
    IonAlert, IonButton,
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
import {personCircle} from "ionicons/icons";
import React, {useState} from "react";

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
                            <IonRouterLink routerLink={"/sign-in"} color={"danger"} className={""}> Sign In</IonRouterLink>
                        </p>
                    </IonCol>
                </IonRow>
            </IonGrid>
        </IonContent>
    </IonPage>
}

export default SignUp;
