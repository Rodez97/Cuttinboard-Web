import type { AnalyticsEvents } from "@rodez97/cuttinboard-library";

export function logAnalyticsEvent(
  eventName: AnalyticsEvents | string,
  eventParams?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }
) {
  import("firebase/analytics").then(({ logEvent, getAnalytics }) => {
    const analytics = getAnalytics();
    analytics && logEvent(analytics, eventName as string, eventParams);
  });
}
