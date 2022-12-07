import { getAnalytics, logEvent } from "firebase/analytics";

export const recordError = (error: Error, fatal?: boolean) => {
  console.error({ error, fatal });
  const analytics = getAnalytics();
  if (!analytics) {
    return;
  }
  logEvent(analytics, "exception", {
    name: error.name,
    description: error.message,
    fatal,
  });
};
