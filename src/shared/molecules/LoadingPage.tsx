/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Spin } from "antd";

function LoadingPage() {
  return (
    <div
      css={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        height: "100%",
        width: "100%",
      }}
    >
      <Spin size="large" />
    </div>
  );
}

export default LoadingPage;
