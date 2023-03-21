/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { ReactElement, useCallback, useMemo, useState } from "react";
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
  useChecklistsActions,
  useCuttinboardLocation,
  useRecurringTasks,
} from "@cuttinboard-solutions/cuttinboard-library";
import TaskBlock from "./TaskBlock";
import { ClearOutlined } from "@ant-design/icons";
import { matchSorter } from "match-sorter";
import RecurringTaskItem from "./RecurringTaskItem";
import { DraggableList } from "../../shared";
import { orderBy } from "lodash";
import {
  getChecklistsSummary,
  extractRecurringTasksArray,
  IChecklist,
  IChecklistGroup,
  IRecurringTaskDoc,
  recurringTaskIsToday,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";
import EmptyExtended from "../../shared/molecules/EmptyExtended";
import NoItems from "../../shared/atoms/NoItems";

export default ({
  tasksDocument,
  recurringTaskDoc,
  createTask,
  bottomElement,
}: {
  tasksDocument: IChecklistGroup | undefined;
  recurringTaskDoc: IRecurringTaskDoc | undefined;
  createTask: () => void;
  bottomElement: ReactElement;
}) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const { role } = useCuttinboardLocation();
  const {
    deleteAllChecklists,
    reorderChecklists,
    addChecklistTask,
    removeChecklist,
    updateChecklistTask,
    changeChecklistTaskStatus,
    removeChecklistTask,
    reorderChecklistTask,
    updateChecklists,
    checklistsArray,
  } = useChecklistsActions("locationChecklists");
  const { completeRecurringTask } = useRecurringTasks();

  const canUse = useMemo(() => role <= RoleAccessLevels.MANAGER, [role]);

  const getSummaryText = useMemo(() => {
    if (!tasksDocument) {
      return `0/0 ${t("task(s) completed")}`;
    }
    const { total, completed } = getChecklistsSummary(tasksDocument);
    return `${completed}/${total} ${t("task(s) completed")}`;
  }, [t, tasksDocument]);

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
        "All tasks will be deleted and you will not be able to undo this action."
      ),
      okText: t("Start New Shift"),
      cancelText: t("Cancel"),
      onOk: () => {
        if (tasksDocument) {
          deleteAllChecklists();
        }
      },
    });
  }, [deleteAllChecklists, t, tasksDocument]);

  const reorderItem = (element: IChecklist, _: number, targetIndex: number) => {
    if (!tasksDocument) {
      return;
    }
    reorderChecklists(element.id, targetIndex);
  };

  return (
    <React.Fragment>
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
                      <a onClick={createTask}>{t("Create one")}</a> {t("or")}{" "}
                      <a
                        href="https://www.cuttinboard.com/help/tasks-app"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("learn more")}
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
                      onAddTask={addChecklistTask}
                      onRemoveChecklist={removeChecklist}
                      onRenameTask={updateChecklistTask}
                      onTaskStatusChange={changeChecklistTaskStatus}
                      onRemoveTask={removeChecklistTask}
                      onRename={updateChecklists}
                      onReorderTasks={reorderChecklistTask}
                    />
                  )}
                  onReorder={reorderItem}
                />
              ) : (
                <NoItems />
              )}
            </Space>
          </div>
          {bottomElement}
        </div>
      </Layout.Content>
    </React.Fragment>
  );
};
