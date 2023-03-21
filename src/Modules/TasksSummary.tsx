/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Alert, Divider, Skeleton, Space, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { RecurringTasksSummary } from "./useSummaryData";

export default function TasksSummary({
  recurringTasksSummary,
  loading,
}: {
  recurringTasksSummary: RecurringTasksSummary;
  loading: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Space
      direction="vertical"
      css={{
        padding: 20,
        flex: 1,
        display: "flex",
      }}
    >
      <Divider orientation="left">{t("Tasks Summary")}</Divider>

      <Skeleton loading={loading}>
        {recurringTasksSummary.length > 0 ? (
          <Space direction="vertical" size="small" css={{ display: "flex" }}>
            <Typography.Title
              level={3}
              css={{
                marginLeft: 20,
                marginRight: 20,
                marginTop: 0,
              }}
              type="secondary"
            >
              {t("Periodic tasks due today")}
            </Typography.Title>
            {recurringTasksSummary.map(([id, task]) => (
              <Alert key={id} message={task.name} className="default-alert" />
            ))}
          </Space>
        ) : (
          <Alert
            message={t("No periodic tasks due today")}
            type="success"
            showIcon
            className="default-alert"
          />
        )}
      </Skeleton>
    </Space>
  );
}
