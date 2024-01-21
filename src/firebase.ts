import { FirebaseOptions, initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { initializePerformance } from "firebase/performance";

// Firebase configuration object
export const FIREBASE_CONFIG: FirebaseOptions = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize the Firebase app
const APP = initializeApp(FIREBASE_CONFIG);

// Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
// key is the counterpart to the secret key you set in the Firebase console.
// initializeAppCheck(APP, {
//   provider: new ReCaptchaV3Provider(process.env.RECAPTCHA3_SITE_KEY),
//   // Optional argument. If true, the SDK automatically refreshes App Check
//   // tokens as needed.
//   isTokenAutoRefreshEnabled: true,
// });

// Initialize Firestore
initializeFirestore(APP, {
  ignoreUndefinedProperties: true,
  experimentalForceLongPolling: true,
});

initializePerformance(APP);
