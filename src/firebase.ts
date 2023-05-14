import { getAnalytics, logEvent } from "firebase/analytics";
import { FirebaseOptions, initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getPerformance } from "firebase/performance";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { AnalyticsEvents } from "@cuttinboard-solutions/cuttinboard-library";

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

// Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
// key is the counterpart to the secret key you set in the Firebase console.
initializeAppCheck(APP, {
  provider: new ReCaptchaV3Provider(process.env.RECAPTCHA3_SITE_KEY),
  // Optional argument. If true, the SDK automatically refreshes App Check
  // tokens as needed.
  isTokenAutoRefreshEnabled: true,
});

// Initialize Firestore
initializeFirestore(APP, {
  ignoreUndefinedProperties: true,
  experimentalForceLongPolling: true,
});

export const ANALYTICS = getAnalytics(APP);

export const PERF = getPerformance(APP);

export function logAnalyticsEvent(
  eventName: AnalyticsEvents,
  eventParams?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }
) {
  logEvent(ANALYTICS, eventName as string, eventParams);
}
