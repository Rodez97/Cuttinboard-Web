import MainRouter from "./MainRouter";
import React from "react";
import TrackPageAnalytics from "./utils/TrackPageAnalytics";
import { recordError } from "./utils/utils";
import { CuttinboardProvider } from "@cuttinboard-solutions/cuttinboard-library/services";
import AuthWrapper from "./Auth/AuthWrapper";
import { LoadingScreen, PageError } from "./components";

function App() {
  return (
    <CuttinboardProvider onError={recordError}>
      {({ user, error, loading }) =>
        loading ? (
          <LoadingScreen />
        ) : error ? (
          <PageError error={error} />
        ) : user ? (
          <>
            <TrackPageAnalytics />
            <MainRouter />
          </>
        ) : (
          <AuthWrapper />
        )
      }
    </CuttinboardProvider>
  );
}

export default App;
