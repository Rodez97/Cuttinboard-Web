/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Space, Typography } from "antd";

// ===========================|| FOOTER - AUTHENTICATION 2 & 3 ||=========================== //
export default () => (
  <Space css={{ padding: "20px", display: "flex", justifyContent: "center" }}>
    <Typography.Text
      css={{ fontSize: 14 }}
      type="secondary"
    >{`Copyright © ${new Date().getFullYear()}. Elevvate Technologies`}</Typography.Text>
  </Space>
);
