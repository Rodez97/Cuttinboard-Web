import React from "react";
import fileSize from "filesize";
import { useLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Progress, Space, Typography } from "antd";

function FilesCounter() {
  const { location } = useLocation();

  return (
    <Space
      direction="vertical"
      style={{
        display: "flex",
        padding: "3px",
        margin: "2px",
        gap: "4px",
        backgroundColor: "transparent",
        border: "1px solid #fff",
      }}
    >
      <Progress
        percent={
          (location.usage.storageUsed / location.usage.storageLimit) * 100
        }
        showInfo={false}
      />
      <Space style={{ display: "flex", justifyContent: "space-between" }}>
        <Typography.Text style={{ fontSize: "14px", color: "#fff" }}>
          {fileSize(location.usage.storageUsed)}
        </Typography.Text>
        <Typography.Text style={{ fontSize: "14px", color: "#fff" }}>
          {fileSize(location.usage.storageLimit)}
        </Typography.Text>
      </Space>
    </Space>
  );
}

export default FilesCounter;
