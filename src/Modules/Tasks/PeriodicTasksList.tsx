/** @jsx jsx */
import {
  RecurringTask,
  RecurringTaskDoc,
} from "@cuttinboard-solutions/cuttinboard-library/checklist";
import { jsx } from "@emotion/react";
import { Card, Empty, Layout } from "antd";
import dayjs from "dayjs";
import { capitalize } from "lodash";
import { useTranslation } from "react-i18next";

export default ({
  recurringTaskDoc,
  onEditTask,
  createTask,
}: {
  recurringTaskDoc: RecurringTaskDoc | undefined;
  onEditTask: (task: [string, RecurringTask]) => void;
  createTask: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <Layout.Content
      css={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "auto",
      }}
    >
      <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
        <div
          css={{
            minWidth: 300,
            maxWidth: 900,
            margin: "auto",
            width: "100%",
          }}
        >
          {recurringTaskDoc?.tasksArraySorted &&
          recurringTaskDoc.tasksArraySorted.length > 0 ? (
            recurringTaskDoc.tasksArraySorted?.map(([id, task]) => (
              <Card
                size="small"
                title={task.name}
                key={id}
                css={{ marginBottom: 8 }}
                hoverable
                onClick={() => onEditTask([id, task])}
              >
                <Card.Meta
                  title={capitalize(
                    dayjs(task.nextOccurrence).format("dddd, MMMM D, YYYY")
                  )}
                  description={capitalize(task.recurrenceRule.toText())}
                />
              </Card>
            ))
          ) : (
            <Empty
              description={
                <span>
                  {t("No periodic tasks found")}.{" "}
                  <a onClick={createTask}>Create one</a> or{" "}
                  <a
                    href="https://www.cuttinboard.com/help/tasks-app"
                    target="_blank"
                    rel="noreferrer"
                  >
                    learn more.
                  </a>
                </span>
              }
            />
          )}
        </div>
      </div>
    </Layout.Content>
  );
};
