import MainRouter from "./MainRouter";
import React from "react";
import TrackPageAnalytics from "./utils/TrackPageAnalytics";
import { recordError } from "./utils/utils";
import { CuttinboardProvider } from "@cuttinboard-solutions/cuttinboard-library/services";
import AuthWrapper from "./Auth/AuthWrapper";
import { LoadingScreen, PageError } from "./components";

function App() {
  return (
    <CuttinboardProvider
      LoadingRenderer={LoadingScreen}
      ErrorRenderer={(err) => {
        recordError(err);
        return <PageError error={err} />;
      }}
      NoUserRenderer={<AuthWrapper />}
    >
      <>
        <TrackPageAnalytics />
        <MainRouter />
      </>
    </CuttinboardProvider>
  );
}

export default App;
