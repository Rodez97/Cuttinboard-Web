/** @jsx jsx */
import { RecurringTaskDoc } from "@cuttinboard-solutions/cuttinboard-library/checklist";
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import { FIRESTORE } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { jsx } from "@emotion/react";
import { Alert, Divider, Skeleton, Space, Typography } from "antd";
import { doc } from "firebase/firestore";
import { useCallback } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default () => {
  const { t } = useTranslation();
  const { location } = useCuttinboardLocation();
  const [recurringTaskDoc, loading, error] = useDocumentData<RecurringTaskDoc>(
    doc(
      FIRESTORE,
      "Organizations",
      location.organizationId,
      "recurringTasks",
      location.id
    ).withConverter(RecurringTaskDoc.firestoreConverter)
  );

  const recurringTasksToday = useCallback(() => {
    if (!recurringTaskDoc) {
      return [];
    }
    return recurringTaskDoc.tasksArray.filter(([, task]) => {
      return task.recurrenceRule && task.isToday;
    });
  }, [recurringTaskDoc]);

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
        {recurringTasksToday().length > 0 ? (
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
            {recurringTasksToday().map(([id, task]) => (
              <Alert key={id} message={task.name} className="default-alert" />
            ))}
          </Space>
        ) : (
          <Alert
            message={t("No periodic tasks due today")}
            description={
              <Link to="../tasks" replace>
                {t("Take me to tasks")}
              </Link>
            }
            type="success"
            showIcon
            className="default-alert"
          />
        )}
      </Skeleton>

      {error && <Alert message={error.message} type="error" showIcon />}
    </Space>
  );
};
