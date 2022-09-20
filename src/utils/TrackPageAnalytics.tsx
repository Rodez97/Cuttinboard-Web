import { getAnalytics, logEvent, setCurrentScreen } from "firebase/analytics";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function TrackPageAnalytics() {
  const location = useLocation();

  useEffect(() => {
    const analytics = getAnalytics();
    if (analytics) {
      const page_path = location.pathname + location.search;
      logEvent(analytics, "page_view", {
        page_path,
      });
    }
  }, [location]);
  return null;
}

export default TrackPageAnalytics;
