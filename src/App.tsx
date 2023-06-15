import ViewMessage from './pages/ViewMessage';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './styles/index.css';
import SignIn from "./pages/SignIn/SignIn";
import SignUp from "./pages/SignUp/SignUp";
import React from "react";
import {Redirect, Route} from "react-router";
import {IonApp, IonRouterOutlet, setupIonicReact} from '@ionic/react';
import SystemControl from "./pages/SystemControl/SystemControl";
import {IonReactRouter} from "@ionic/react-router";


setupIonicReact();

const App = () => {

    return (
        <IonApp>
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
        </IonApp>
    );
};

export default App;
