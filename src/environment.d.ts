declare global {
  namespace NodeJS {
    interface ProcessEnv {
      STRIPE_PRODUCT_ID: string;
      STRIPE_PRICE_ID: string;
      RECAPTCHA3_SITE_KEY: string;
      TRANSLATIONS_SA_CLIENT_EMAIL: string;
      TRANSLATIONS_SA_PRIVATE_KEY: string;
      NODE_ENV: "development" | "production";
      production: boolean;
      // Firebase
      FIREBASE_API_KEY: string;
      FIREBASE_AUTH_DOMAIN: string;
      FIREBASE_DATABASE_URL: string;
      FIREBASE_PROJECT_ID: string;
      FIREBASE_STORAGE_BUCKET: string;
      FIREBASE_MESSAGING_SENDER_ID: string;
      FIREBASE_APP_ID: string;
      FIREBASE_MEASUREMENT_ID: string;
    }
  }
}

export {};
