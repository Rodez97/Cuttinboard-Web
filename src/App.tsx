import { useCuttinboardRaw } from "@cuttinboard-solutions/cuttinboard-library";
import React, { lazy, Suspense } from "react";
import { PageError } from "./shared";
import useTrackPageAnalytics from "./utils/TrackPageAnalytics";

const AuthWrapper = lazy(() => import("./Auth/AuthWrapper"));
const MainRouter = lazy(() => import("./MainRouter"));
const RootLoading = lazy(() => import("./shared/molecules/RootLoading"));

function App() {
  const { loading, error, user } = useCuttinboardRaw();
  useTrackPageAnalytics();

  if (loading) {
    return <RootLoading />;
  }

  if (error) {
    return <PageError error={new Error(error)} />;
  }

  if (!user) {
    return (
      <Suspense fallback={<RootLoading />}>
        <AuthWrapper />
      </Suspense>
    );
  }

  return <Suspense fallback={<RootLoading />}>{<MainRouter />}</Suspense>;
}

export default App;
