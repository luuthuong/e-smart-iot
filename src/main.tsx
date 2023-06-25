import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import {FirebaseDatabaseNode, FirebaseDatabaseProvider} from "@react-firebase/database";
import {firebaseConfig} from "./database";
import firebase from "firebase/app";

// eslint-disable-next-line no-undef
const container = document.getElementById('root');
// @ts-ignore
const root = createRoot(container);
root.render(
  <React.StrictMode>
        <FirebaseDatabaseProvider {...firebaseConfig}>
                <App/>
        </FirebaseDatabaseProvider>
  </React.StrictMode>
);
