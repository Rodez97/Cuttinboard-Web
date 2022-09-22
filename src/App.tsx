import MainRouter from "./MainRouter";
import React from "react";
import TrackPageAnalytics from "./utils/TrackPageAnalytics";
import PageError from "./components/PageError";
import { LoadingScreen } from "./components/LoadingScreen";
import { recordError } from "./utils/utils";
import { CuttinboardProvider } from "@cuttinboard-solutions/cuttinboard-library/services";
import AuthWrapper from "./Auth/AuthWrapper";

function App() {
  const onError = (error: Error) => recordError(error);
  const ErrorElement = (error: Error) => <PageError error={error} />;
  return (
    <CuttinboardProvider
      authScreen={<AuthWrapper />}
      LoadingElement={<LoadingScreen />}
      onError={onError}
      ErrorElement={ErrorElement}
    >
      <TrackPageAnalytics />
      <MainRouter />
    </CuttinboardProvider>
  );
}

export default App;
