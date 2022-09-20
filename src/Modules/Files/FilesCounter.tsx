import React from "react";
import fileSize from "filesize";
import { useLocation } from "@cuttinboard/cuttinboard-library/services";
import { Progress, Space, Typography } from "antd";
import { Colors } from "@cuttinboard/cuttinboard-library/utils";

function FilesCounter() {
  const { usage } = useLocation();

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
        percent={(usage?.storageUsed / usage.storageLimit) * 100}
        showInfo={false}
      />
      <Space style={{ display: "flex", justifyContent: "space-between" }}>
        <Typography.Text style={{ fontSize: "14px", color: "#fff" }}>
          {fileSize(usage?.storageUsed)}
        </Typography.Text>
        <Typography.Text style={{ fontSize: "14px", color: "#fff" }}>
          {fileSize(usage.storageLimit)}
        </Typography.Text>
      </Space>
    </Space>
  );
}

export default FilesCounter;
