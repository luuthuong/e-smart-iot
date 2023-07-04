import {getFirestore} from "@firebase/firestore";
import { initializeApp } from "firebase/app";
import {FirebaseOptions} from "@firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

export const firebaseConfig: FirebaseOptions = {
    apiKey: "AIzaSyDW2CyYpd_sjTfqt2a76ugJ_xZUJ-x76Sc",
    authDomain: "e-smart-iot.firebaseapp.com",
    databaseURL: "https://e-smart-iot-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "e-smart-iot",
    storageBucket: "e-smart-iot.appspot.com",
    messagingSenderId: "66132179619",
    appId: "1:66132179619:web:2edd15dded2907e56a1d16",
    measurementId: "G-WQS8REXTC1"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const firestore = getFirestore(app);
export const database = getDatabase();
