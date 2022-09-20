/** @jsx jsx */
import { jsx } from "@emotion/react";
import Lottie from "lottie-react";
import StartAnimation from "../assets/StartAnimation.json";

export const LoadingScreen = () => (
  <div
    css={{ display: "flex", justifyContent: "center", alignItems: "center", flex:1 }}
  >
    <Lottie animationData={StartAnimation} loop style={{ width: 600 }} />
  </div>
);
