/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Space, Typography } from "antd";
import { FirebaseError } from "firebase/app";

function PageError({ error }: { error: FirebaseError | Error }) {
  return (
    <Space
      css={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography.Title level={5}>{error.message}</Typography.Title>
    </Space>
  );
}

export default PageError;
