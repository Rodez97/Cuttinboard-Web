import React from "react";
import "./i18n";
import "./firebase";
import reportWebVitals from "./reportWebVitals";
import "./styles/custom-classes.less";
import { createRoot } from "react-dom/client";
import Root from "./Root";
import registerSW from "./registerSW";

export const container = document.getElementById("root");
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container!);
root.render(<Root />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
registerSW();
