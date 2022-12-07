import React, { lazy } from "react";
import "./i18n";
import reportWebVitals from "./reportWebVitals";
import "./styles/custom-classes.less";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { createRoot } from "react-dom/client";
import MainAppRoot from "./Root";
import { enableIndexedDbPersistence } from "firebase/firestore";
import { recordError } from "./utils/utils";
import { FIRESTORE } from "@cuttinboard-solutions/cuttinboard-library/utils";

export const MainApp = lazy(() => import("./App"));

enableIndexedDbPersistence(FIRESTORE).catch((err) => {
  if (err.code == "failed-precondition") {
    // Multiple tabs open, persistence can only be enabled
    // in one tab at a a time.
    recordError(err);
  } else if (err.code == "unimplemented") {
    // The current browser does not support all of the
    // features required to enable persistence
    recordError(err);
  }
});

export const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<MainAppRoot />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
