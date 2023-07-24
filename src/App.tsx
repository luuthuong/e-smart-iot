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
import React, {useState} from "react";
import {IonApp, IonBackdrop, setupIonicReact} from '@ionic/react';
import AppRouter from "./AppRouter";
import {BackDropContext} from './shared/context';


setupIonicReact();

const App = () => {
    const [state, setState] = useState<boolean>(false);
    return (
        <BackDropContext.Provider value={setState}>
            { state && <IonBackdrop></IonBackdrop>}
            <IonApp>
                <AppRouter/>
            </IonApp>
        </BackDropContext.Provider>

    );
};

export default App;
