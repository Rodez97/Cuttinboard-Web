/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Button, Layout, Space } from "antd";
import { useTranslation } from "react-i18next";
import { GrayPageHeader, LoadingPage } from "../../shared";
import TasksMain from "./TasksMain";
import { upperFirst } from "lodash";
import dayjs from "dayjs";
import {
  useChecklistsActions,
  useCuttinboardLocation,
  useDisclose,
  useLocationChecklistsData,
  useRecurringTasks,
} from "@cuttinboard-solutions/cuttinboard-library";
import { ClockCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useRef } from "react";
import PeriodicTasksList from "./PeriodicTasksList";
import { nanoid } from "nanoid";
import usePageTitle from "../../hooks/usePageTitle";
import ErrorPage from "../../shared/molecules/PageError";
import { RoleAccessLevels } from "@cuttinboard-solutions/types-helpers";

export default function Tasks() {
  usePageTitle("Tasks");
  const { t } = useTranslation();
  const { role } = useCuttinboardLocation();
  const scrollBottomTarget = useRef<HTMLDivElement>(null);
  const { checklistGroup, addChecklist } =
    useChecklistsActions("locationChecklists");
  const { recurringTaskDoc } = useRecurringTasks();
  const { loading, error } = useLocationChecklistsData();
  const [isPeriodicTasksOpen, openPeriodicTasks, closePeriodicTasks] =
    useDisclose(false);

  const addBlock = () => {
    addChecklist(nanoid());
    scrollBottomTarget.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPage error={new Error(error)} />;
  }

  return (
    <Layout>
      <GrayPageHeader
        title={upperFirst(dayjs().format("dddd, MMMM D YYYY"))}
        extra={
          role <= RoleAccessLevels.MANAGER && (
            <Space>
              <Button icon={<PlusCircleOutlined />} onClick={addBlock}>
                {t("New Task List")}
              </Button>
              <Button
                icon={<ClockCircleOutlined />}
                onClick={openPeriodicTasks}
              >
                {t("Periodic Tasks")}
              </Button>
            </Space>
          )
        }
      />
      <TasksMain
        tasksDocument={checklistGroup}
        recurringTaskDoc={recurringTaskDoc}
        createTask={addBlock}
        bottomElement={<div ref={scrollBottomTarget} css={{ height: 50 }} />}
      />

      {role <= RoleAccessLevels.MANAGER && (
        <PeriodicTasksList
          open={isPeriodicTasksOpen}
          onClose={closePeriodicTasks}
        />
      )}
    </Layout>
  );
}
