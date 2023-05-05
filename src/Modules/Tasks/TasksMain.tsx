/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  Divider,
  Input,
  Layout,
  Modal,
  Space,
  Typography,
} from "antd";
import {
  useChecklist,
  useCuttinboardLocation,
  useDisclose,
  useRecurringTasks,
} from "@cuttinboard-solutions/cuttinboard-library";
import TaskBlock from "./TaskBlock";
import {
  ClearOutlined,
  ClockCircleOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { matchSorter } from "match-sorter";
import RecurringTaskItem from "./RecurringTaskItem";
import { DraggableList, GrayPageHeader, LoadingPage } from "../../shared";
import { orderBy, upperFirst } from "lodash";
import {
  getChecklistsSummary,
  extractRecurringTasksArray,
  IChecklist,
  recurringTaskIsToday,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";
import EmptyExtended from "../../shared/molecules/EmptyExtended";
import NoItems from "../../shared/atoms/NoItems";
import ErrorPage from "../../shared/molecules/PageError";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import PeriodicTasksList from "./PeriodicTasksList";

export default function TasksMain() {
  const { t } = useTranslation();
  const scrollBottomTarget = useRef<HTMLDivElement>(null);
  const [isPeriodicTasksOpen, openPeriodicTasks, closePeriodicTasks] =
    useDisclose(false);
  const [searchText, setSearchText] = useState("");
  const { role } = useCuttinboardLocation();
  const {
    deleteAllChecklists,
    reorderChecklistsPosition,
    addTaskToChecklist,
    deleteChecklist,
    updateChecklistTask,
    changeChecklistTaskStatus,
    removeTaskFromChecklist,
    reorderTaskPositions,
    updateChecklistsData,
    addNewChecklist,
    checklistsArray,
    checklistGroup,
    loading,
    error,
  } = useChecklist();
  const {
    completeRecurringTask,
    recurringTaskDoc,
    loading: rtLoading,
    error: rtError,
  } = useRecurringTasks();

  const canUse = useMemo(() => role <= RoleAccessLevels.MANAGER, [role]);

  const getSummaryText = useMemo(() => {
    if (!checklistGroup) {
      return t("{{0}} task(s) completed", { 0: "0/0" });
    }
    const { total, completed } = getChecklistsSummary(checklistGroup);
    return t("{{0}} task(s) completed", { 0: `${completed}/${total}` });
  }, [t, checklistGroup]);

  const sectionsOrderedByTagAndCreationDate = useMemo(() => {
    if (!checklistsArray) {
      return [];
    }
    if (checklistsArray.length === 0) {
      return [];
    }

    return searchText
      ? matchSorter(checklistsArray, searchText, {
          keys: ["name"],
        })
      : checklistsArray;
  }, [checklistsArray, searchText]);

  const recurringTasksToday = useMemo(() => {
    if (!recurringTaskDoc) {
      return [];
    }
    const tasksArray = extractRecurringTasksArray(recurringTaskDoc);
    const filtered = tasksArray.filter(([, task]) => {
      return recurringTaskIsToday(task);
    });
    return orderBy(filtered, (task) => task[1].name);
  }, [recurringTaskDoc]);

  const startNewShift = useCallback(() => {
    Modal.confirm({
      title: t("Are you sure you want to start a new shift?"),
      content: t(
        "All tasks will be deleted and you will not be able to undo this action"
      ),
      okText: t("Start New Shift"),
      cancelText: t("Cancel"),
      onOk: () => {
        if (checklistGroup) {
          deleteAllChecklists();
        }
      },
    });
  }, [deleteAllChecklists, t, checklistGroup]);

  const reorderItem = (element: IChecklist, _: number, targetIndex: number) => {
    if (!checklistGroup) {
      return;
    }
    reorderChecklistsPosition(element.id, targetIndex);
  };

  const addBlock = () => {
    addNewChecklist(nanoid());
    scrollBottomTarget.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  if (loading || rtLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPage error={error} />;
  }

  if (rtError) {
    return <ErrorPage error={rtError} />;
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
                {t("Recurring Tasks")}
              </Button>
            </Space>
          )
        }
      />
      <Space css={{ marginBottom: 20, padding: "10px 20px" }}>
        <Input.Search
          placeholder={t("Search")}
          allowClear
          onChange={({ currentTarget }) => setSearchText(currentTarget.value)}
          value={searchText}
          css={{ width: 200 }}
        />
        {canUse && (
          <Button
            icon={<ClearOutlined />}
            onClick={startNewShift}
            type="primary"
          >
            {t("Start New Shift")}
          </Button>
        )}
      </Space>
      <Layout.Content
        css={{
          overflow: "auto",
        }}
      >
        {recurringTasksToday.length > 0 && (
          <React.Fragment>
            <Card
              css={{
                display: "flex",
                flexDirection: "column",
                minWidth: 300,
                maxWidth: 900,
                margin: "auto",
                width: "100%",
                gap: 16,
              }}
            >
              <Typography.Text
                type="secondary"
                css={{
                  fontSize: 20,
                }}
              >
                {t("Today's recurring tasks")}:
              </Typography.Text>
              <div
                css={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  padding: "0 16px",
                  paddingTop: 10,
                }}
              >
                {recurringTasksToday.map(([id, task]) => (
                  <RecurringTaskItem
                    task={task}
                    key={id}
                    onChange={() => completeRecurringTask(id)}
                  />
                ))}
              </div>
            </Card>
          </React.Fragment>
        )}

        <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
          <div
            css={{
              minWidth: 300,
              maxWidth: 900,
              margin: "auto",
              width: "100%",
            }}
          >
            <Divider orientation="left">
              <Typography.Text>{getSummaryText}</Typography.Text>
            </Divider>
            <Space direction="vertical" css={{ display: "flex" }}>
              {checklistsArray.length === 0 ? (
                <EmptyExtended
                  description={
                    <span>
                      {t("No tasks found")}
                      {". "}
                      <a onClick={addBlock}>{t("Create one")}</a> {t("or")}{" "}
                      <a
                        href="http://www.cuttinboard.com/help/tasks"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("Learn more")}
                      </a>
                    </span>
                  }
                  descriptions={[
                    "Create, print and distribute shift task lists",
                    "Monitor progress towards a successful shift",
                    "Create periodic tasks that keep your restaurant running like clockwork",
                    "Create recurrent tasks that create a sustainable routine at your restaurant",
                  ]}
                />
              ) : sectionsOrderedByTagAndCreationDate.length > 0 ? (
                <DraggableList<IChecklist>
                  dataSource={sectionsOrderedByTagAndCreationDate}
                  renderItem={(checklist, i, isDragging) => (
                    <TaskBlock
                      key={i}
                      section={checklist}
                      sectionId={checklist.id}
                      canManage={canUse}
                      isDragging={isDragging}
                      onAddTask={addTaskToChecklist}
                      onRemoveChecklist={deleteChecklist}
                      onRenameTask={updateChecklistTask}
                      onTaskStatusChange={changeChecklistTaskStatus}
                      onRemoveTask={removeTaskFromChecklist}
                      onRename={updateChecklistsData}
                      onReorderTasks={reorderTaskPositions}
                    />
                  )}
                  onReorder={reorderItem}
                />
              ) : (
                <NoItems />
              )}
            </Space>
          </div>
          <div ref={scrollBottomTarget} css={{ height: 50 }} />
        </div>
      </Layout.Content>

      {role <= RoleAccessLevels.MANAGER && (
        <PeriodicTasksList
          open={isPeriodicTasksOpen}
          onClose={closePeriodicTasks}
        />
      )}
    </Layout>
  );
}
