import * as admin from "firebase-admin";
import serviceAccount from "./account-service.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL:
    "https://e-smart-iot-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const db = admin.firestore();
export { admin, db };
