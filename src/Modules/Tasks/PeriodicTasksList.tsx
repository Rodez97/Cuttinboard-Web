/** @jsx jsx */
import { useRecurringTasks } from "@rodez97/cuttinboard-library";
import { jsx } from "@emotion/react";
import { Button, Card, Drawer, DrawerProps, Empty } from "antd/es";
import dayjs from "dayjs";
import { useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import {
  extractRecurringTasksArray,
  getNextOccurrence,
  IRecurringTask,
} from "@rodez97/types-helpers";
import { PlusCircleOutlined } from "@ant-design/icons";
import ManagePeriodicTask, {
  ManagePeriodicTaskRef,
} from "./ManagePeriodicTask";
dayjs.extend(LocalizedFormat);

export default (props: DrawerProps) => {
  const { t } = useTranslation();
  const { recurringTaskDoc } = useRecurringTasks();
  const managePeriodicTaskRef = useRef<ManagePeriodicTaskRef>(null);

  const recurringTasksArray = useMemo(() => {
    if (!recurringTaskDoc) {
      return [];
    }
    return extractRecurringTasksArray(recurringTaskDoc);
  }, [recurringTaskDoc]);

  const renderRR = useCallback(
    ([id, task]: [string, IRecurringTask]): jsx.JSX.Element => {
      const nextOccurrence = getNextOccurrence(task);
      const nxtOcc = nextOccurrence.format("dddd, ll");

      return (
        <Card
          size="small"
          title={task.name}
          key={id}
          css={{ marginBottom: 8 }}
          hoverable
          onClick={() => managePeriodicTaskRef.current?.openEdit([id, task])}
        >
          <Card.Meta title={t(`Next: {{0}}`, { 0: nxtOcc })} />
        </Card>
      );
    },
    [t]
  );

  return (
    <Drawer
      {...props}
      title={t("Recurring Tasks")}
      placement="right"
      width={400}
      extra={
        <Button
          type="primary"
          onClick={() => managePeriodicTaskRef.current?.openNew()}
          icon={<PlusCircleOutlined />}
        >
          {t("Create")}
        </Button>
      }
    >
      <div>
        {recurringTasksArray.length > 0 ? (
          recurringTasksArray.map(renderRR)
        ) : (
          <Empty
            description={
              <span>
                {t("No recurring tasks found")}
                {". "}
                <a onClick={() => managePeriodicTaskRef.current?.openNew()}>
                  {t("Create one")}
                </a>{" "}
                {t("or")}{" "}
                <a
                  href="http://www.cuttinboard.com/help/recurring-tasks"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("Learn more")}
                </a>
              </span>
            }
          />
        )}

        <ManagePeriodicTask
          ref={managePeriodicTaskRef}
          recurringTaskDoc={recurringTaskDoc}
        />
      </div>
    </Drawer>
  );
};
