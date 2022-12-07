import React, { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { LoadingScreen } from "./components";
import { MainApp } from "./index";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default () => (
  <React.StrictMode>
    <Suspense fallback={<LoadingScreen />}>
      <BrowserRouter>
        <DndProvider backend={HTML5Backend}>
          <MainApp />
        </DndProvider>
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>
);
