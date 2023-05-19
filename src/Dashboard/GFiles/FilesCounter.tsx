/** @jsx jsx */
import { jsx } from "@emotion/react";
import fileSize from "filesize";
import { Progress, Space, Typography } from "antd/es";
import { useDashboard } from "../DashboardProvider";
import { useMemo } from "react";

export default () => {
  const { organization } = useDashboard();

  const used = useMemo(
    () => Number(organization?.storageUsed ?? 0),
    [organization]
  );
  const limit = useMemo(
    () => Number(organization?.limits?.storage ?? 0),
    [organization]
  );
  const percent = useMemo(() => (used / limit) * 100, [limit, used]);

  if (!organization) {
    return null;
  }

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
      <Progress percent={percent} showInfo={false} />
      <Space css={{ display: "flex", justifyContent: "space-between" }}>
        <Typography.Text css={{ fontSize: "14px", color: "#74726e" }}>
          {fileSize(used)}
        </Typography.Text>
        <Typography.Text css={{ fontSize: "14px", color: "#74726e" }}>
          {fileSize(limit)}
        </Typography.Text>
      </Space>
    </Space>
  );
};
