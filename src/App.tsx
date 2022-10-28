import MainRouter from "./MainRouter";
import React from "react";
import TrackPageAnalytics from "./utils/TrackPageAnalytics";
import PageError from "./components/PageError";
import { LoadingScreen } from "./components/LoadingScreen";
import { recordError } from "./utils/utils";
import { CuttinboardProvider } from "@cuttinboard-solutions/cuttinboard-library/services";
import AuthWrapper from "./Auth/AuthWrapper";

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
