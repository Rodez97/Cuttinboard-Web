import { ANALYTICS } from "firebase";
import { logEvent } from "firebase/analytics";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function useTrackPageAnalytics() {
  const location = useLocation();

  useEffect(() => {
    if (ANALYTICS) {
      const page_path = location.pathname + location.search;
      logEvent(ANALYTICS, "page_view", {
        page_path,
      });
    }
  }, [location]);
}

export default useTrackPageAnalytics;
