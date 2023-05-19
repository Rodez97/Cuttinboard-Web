import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logAnalyticsEvent } from "./analyticsHelpers";

function useTrackPageAnalytics() {
  const location = useLocation();

  useEffect(() => {
    const page_path = location.pathname + location.search;
    logAnalyticsEvent("page_view", {
      page_path,
    });
  }, [location]);
}

export default useTrackPageAnalytics;
