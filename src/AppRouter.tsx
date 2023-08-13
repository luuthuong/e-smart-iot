import React from "react";
import {IonRouterOutlet} from "@ionic/react";
import {Route} from "react-router-dom";
import SignIn from "./pages/SignIn/SignIn";
import SignUp from "./pages/SignUp/SignUp";
import SystemControl from "./pages/SystemControl/SystemControl";
import {IonReactRouter} from "@ionic/react-router";


const AppRouter = () =>
    <IonReactRouter>
        <IonRouterOutlet>
            <Route component={SignIn} path="/sign-in" exact={true}>
            </Route>

            <Route component={SignUp} path="/sign-up" exact={true}>
            </Route>

            <Route component={SystemControl} path="">
            </Route>
        </IonRouterOutlet>
    </IonReactRouter>
export default AppRouter;
