import React from "react";
import {IonRouterOutlet} from "@ionic/react";
import {Redirect, Route} from "react-router";
import SignIn from "./pages/SignIn/SignIn";
import SignUp from "./pages/SignUp/SignUp";
import SystemControl from "./pages/SystemControl/SystemControl";
import ViewMessage from "./pages/ViewMessage";
import {IonReactRouter} from "@ionic/react-router";

const AppRouter = () =>
    <IonReactRouter>
        <IonRouterOutlet>
            <Route path="/" exact={true}>
                <Redirect to="/home"/>
            </Route>

            <Route component={SignIn} path="/sign-in">
            </Route>

            <Route component={SignUp} path="/sign-up">
            </Route>

            <Route component={SystemControl} path="/home" exact={true}>
            </Route>

            <Route component={ViewMessage} path="/message/:id">
            </Route>
        </IonRouterOutlet>
    </IonReactRouter>
export default AppRouter;
