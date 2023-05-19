import React, { lazy, Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { LoadingPage } from "./shared";
import { recordError } from "./utils/utils";

const App = lazy(() => import("./App"));
const CuttinboardProvider = lazy(() =>
  import("@cuttinboard-solutions/cuttinboard-library").then((module) => ({
    default: module.CuttinboardProvider,
  }))
);

export default function Root() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <Suspense fallback={<LoadingPage />}>
          <CuttinboardProvider onError={recordError}>
            <App />
          </CuttinboardProvider>
        </Suspense>
      </BrowserRouter>
    </React.StrictMode>
  );
}
