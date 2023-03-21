import { getAnalytics } from "firebase/analytics";
import { FirebaseOptions, initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

// Firebase configuration object
export const FIREBASE_CONFIG: FirebaseOptions = {
  apiKey: "AIzaSyAfvaqijLqBAj8dou3yTbbzrUbO-8jT32k",
  authDomain: "app.cuttinboard.com",
  databaseURL: "https://cuttinboard-2021-default-rtdb.firebaseio.com",
  projectId: "cuttinboard-2021",
  storageBucket: "cuttinboard-2021.appspot.com",
  messagingSenderId: "286988124291",
  appId: "1:286988124291:web:114898298b49f9ab949bb6",
  measurementId: "G-F2B7ZNZWD3",
};

// Initialize the Firebase app
const APP = initializeApp(FIREBASE_CONFIG);

// Initialize Firestore
initializeFirestore(APP, {
  ignoreUndefinedProperties: true,
  experimentalForceLongPolling: true,
});

export const ANALYTICS = getAnalytics(APP);
