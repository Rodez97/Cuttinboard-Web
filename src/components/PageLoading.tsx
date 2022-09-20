/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Spin } from "antd";

function PageLoading() {
  return (
    <div
      css={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
      }}
    >
      <Spin size="large" />
    </div>
  );
}

export default PageLoading;
