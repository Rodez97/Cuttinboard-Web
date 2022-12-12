/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { ReactElement, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  Divider,
  Empty,
  Input,
  Layout,
  Space,
  Typography,
} from "antd";
import { RoleAccessLevels } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { recordError } from "../../utils/utils";
import TaskBlock from "./TaskBlock";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { matchSorter } from "match-sorter";
import RecurringTaskItem from "./RecurringTaskItem";
import {
  Checklist,
  ChecklistGroup,
  RecurringTaskDoc,
} from "@cuttinboard-solutions/cuttinboard-library/checklist";
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import { DraggableList } from "../../shared";

export default ({
  tasksDocument,
  recurringTaskDoc,
  createTask,
  bottomElement,
}: {
  tasksDocument: ChecklistGroup | undefined;
  recurringTaskDoc: RecurringTaskDoc | undefined;
  createTask: () => void;
  bottomElement: ReactElement;
}) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { locationAccessKey } = useCuttinboardLocation();

  const canUse = useMemo(
    () => locationAccessKey.role <= RoleAccessLevels.MANAGER,
    [locationAccessKey]
  );

  const getSummaryText = useMemo(() => {
    const total = tasksDocument?.summary.total ?? 0;
    const completed = tasksDocument?.summary.completed ?? 0;
    return `${completed}/${total} ${t("task(s) completed")}`;
  }, [t, tasksDocument?.summary.completed, tasksDocument?.summary.total]);

  const sectionsOrderedByTagAndCreationDate = useMemo(() => {
    if (!tasksDocument || tasksDocument?.checklistsArray.length === 0) {
      return [];
    }

    const filteredSections = searchText
      ? matchSorter(tasksDocument.checklistsArray, searchText, {
          keys: ["name"],
        })
      : tasksDocument.checklistsArray;

    return filteredSections;
  }, [tasksDocument, searchText]);

  const recurringTasksToday = useMemo(() => {
    if (!recurringTaskDoc) {
      return [];
    }
    return recurringTaskDoc.tasksArray.filter(([, task]) => {
      return task.recurrenceRule && task.isToday;
    });
  }, [recurringTaskDoc]);

  const startNewShift = useCallback(async () => {
    const confirmed = confirm(
      t(
        "Are you sure you want to start a new shift? All tasks will be deleted."
      )
    );
    if (confirmed) {
      try {
        if (tasksDocument) {
          await tasksDocument.deleteAllTasks();
        }
      } catch (error) {
        recordError(error);
      }
    }
  }, [t, tasksDocument]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

  const onRecurringTaskChange = useCallback(
    async (taskId: string) => {
      if (recurringTaskDoc) {
        try {
          await recurringTaskDoc.toggleCompleted(taskId);
        } catch (error) {
          reportError(error);
        }
      }
    },
    [recurringTaskDoc]
  );

  const reorderItem = async (
    element: Checklist,
    sourceIndex: number,
    targetIndex: number
  ) => {
    if (!tasksDocument) {
      return;
    }
    try {
      await tasksDocument.reorderChecklists(element.id, targetIndex);
    } catch (error) {
      recordError(error);
    }
  };

  return (
    <Layout>
      <Space css={{ marginBottom: 20, padding: "2px 20px" }}>
        <Button
          onClick={toggleSortOrder}
          icon={
            sortOrder === "asc" ? <ArrowUpOutlined /> : <ArrowDownOutlined />
          }
        >
          {t("Creation")}
        </Button>
        <Input.Search
          placeholder={t("Search")}
          allowClear
          onChange={({ currentTarget }) => setSearchText(currentTarget.value)}
          value={searchText}
          css={{ width: 200 }}
        />
        <Button icon={<ClearOutlined />} onClick={startNewShift} type="primary">
          {t("Start New Shift")}
        </Button>
      </Space>
      <Layout.Content>
        {recurringTasksToday.length > 0 && tasksDocument && (
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
                    onChange={() => onRecurringTaskChange(id)}
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
              {sectionsOrderedByTagAndCreationDate.length > 0 &&
              tasksDocument ? (
                <DraggableList<Checklist>
                  dataSource={sectionsOrderedByTagAndCreationDate}
                  renderItem={(checklist, i, isDragging) => (
                    <TaskBlock
                      key={i}
                      section={checklist}
                      sectionId={checklist.id}
                      canManage={canUse}
                      rootChecklist={tasksDocument}
                      isDragging={isDragging}
                    />
                  )}
                  onReorder={reorderItem}
                />
              ) : (
                <Empty
                  description={
                    <span>
                      {t("No tasks found")}.{" "}
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
            </Space>
          </div>
          {bottomElement}
        </div>
      </Layout.Content>
    </Layout>
  );
};
