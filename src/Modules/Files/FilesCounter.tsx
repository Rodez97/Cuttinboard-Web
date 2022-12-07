/** @jsx jsx */
import { jsx } from "@emotion/react";
import fileSize from "filesize";
import { Progress, Space, Typography } from "antd";
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library/services";

export default () => {
  const { location } = useCuttinboardLocation();

  return (
    <Space
      direction="vertical"
      css={{
        display: "flex",
        padding: "5px",
        margin: "2px",
        gap: "4px",
        backgroundColor: "transparent",
        border: "1px solid #74726e",
      }}
    >
      <Progress
        percent={
          (location.usage.storageUsed / location.usage.storageLimit) * 100
        }
        showInfo={false}
      />
      <Space css={{ display: "flex", justifyContent: "space-between" }}>
        <Typography.Text css={{ fontSize: "14px", color: "#74726e" }}>
          {fileSize(location.usage.storageUsed)}
        </Typography.Text>
        <Typography.Text css={{ fontSize: "14px", color: "#74726e" }}>
          {fileSize(location.usage.storageLimit)}
        </Typography.Text>
      </Space>
    </Space>
  );
};
