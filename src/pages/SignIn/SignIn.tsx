import {
    IonAlert,
    IonButton, IonCard, IonCardContent,
    IonCol, IonContent, IonGrid,
    IonHeader, IonInput,
    IonPage,
    IonRouterLink,
    IonRow,
    IonTitle,
    IonToolbar, useIonRouter, useIonToast
} from "@ionic/react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import React, {useEffect, useState} from "react";
import {Logo} from "../../data/svg-control";
import {auth} from "../../database";

const SignIn = () => {

    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [message] = useState<string>("Error");

    const [present] = useIonToast();
    const presentToast = (msg: string, color: string, position: 'top' | 'middle' | 'bottom' = 'bottom') => {
        present({
            message: msg,
            duration: 1500,
            position: position,
            color: color
        });
    };

    useEffect(() => {
        signOut(auth).then(() =>{

        }).catch(err =>{
            console.log(err)
        })
    }, []);
    const router = useIonRouter();
    const onSignIn = () => {
        signInWithEmailAndPassword(auth, userName, password)
            .then(res =>{
            console.log(res)
            if(res.user.uid){
                presentToast("Login success", "success", "top");
                router.push("/system","forward");
            }
        }).catch(err =>{
            presentToast("Login failed!", "danger", "top");
        })
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
                                <IonCol>
                                    <IonButton color={"danger"} onClick={onSignIn}>
                                        Sign In
                                    </IonButton>
                                </IonCol>
                            </IonRow>
                            {/*<IonRow>*/}
                            {/*    <IonCol>*/}
                            {/*        <p>*/}
                            {/*            Don't have any account?*/}
                            {/*            <IonRouterLink routerLink={"/sign-up"} color={"danger"} className={""}>Sign*/}
                            {/*                Up</IonRouterLink>*/}
                            {/*        </p>*/}
                            {/*    </IonCol>*/}
                            {/*</IonRow>*/}
                        </IonGrid>
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    )
};

export default SignIn;
