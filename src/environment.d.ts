declare global {
  namespace NodeJS {
    interface ProcessEnv {
      STRIPE_PRICE_ID: string;
      NODE_ENV: "development" | "production";
      STRIPE_PRODUCT_ID: string;
      RECAPTCHA3_SITE_KEY: string;
    }
  }
}

export {};
