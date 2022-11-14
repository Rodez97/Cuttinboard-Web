import React, { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { LoadingScreen } from "./components";
import { MainApp } from "./index";

export default () => (
  <React.StrictMode>
    <Suspense fallback={<LoadingScreen />}>
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>
);
