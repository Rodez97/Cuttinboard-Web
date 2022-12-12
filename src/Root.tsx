import React, { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { MainApp } from "./index";
import { RootLoading } from "./shared";

export default () => (
  <React.StrictMode>
    <Suspense fallback={<RootLoading />}>
      <BrowserRouter>
        <MainApp />
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>
);
