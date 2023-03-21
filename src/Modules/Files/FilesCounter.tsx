/** @jsx jsx */
import { jsx } from "@emotion/react";
import fileSize from "filesize";
import { Progress, Space, Typography } from "antd";
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library";
import { useMemo } from "react";
import { getLocationUsage } from "@cuttinboard-solutions/types-helpers";

export default () => {
  const { location } = useCuttinboardLocation();

  const locationUsage = useMemo(() => {
    const usage = getLocationUsage(location);

    return {
      percent: (usage.storageUsed / usage.storageLimit) * 100,
      storageUsed: fileSize(usage.storageUsed),
      storageLimit: fileSize(usage.storageLimit),
    };
  }, [location]);

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
      <Progress percent={locationUsage.percent} showInfo={false} />
      <Space css={{ display: "flex", justifyContent: "space-between" }}>
        <Typography.Text css={{ fontSize: "14px", color: "#74726e" }}>
          {locationUsage.storageUsed}
        </Typography.Text>
        <Typography.Text css={{ fontSize: "14px", color: "#74726e" }}>
          {locationUsage.storageLimit}
        </Typography.Text>
      </Space>
    </Space>
  );
};
