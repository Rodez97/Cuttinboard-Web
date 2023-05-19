/** @jsx jsx */
import { jsx } from "@emotion/react";
import StartAnimation from "../../assets/StartAnimation.json";
import { Suspense, lazy } from "react";

// Lazy loading lottie
const Lottie = lazy(() => import("lottie-react"));

const RootLoading = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <div
      css={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
      }}
    >
      <Lottie animationData={StartAnimation} loop style={{ width: 600 }} />
    </div>
  </Suspense>
);

export default RootLoading;
