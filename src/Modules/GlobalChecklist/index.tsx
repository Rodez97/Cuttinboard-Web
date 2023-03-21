/** @jsx jsx */
import { jsx } from "@emotion/react";
import { ClearOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, Layout, Space } from "antd";
import { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { GrayPageHeader, DraggableList, LoadingPage } from "../../shared";
import TaskBlock from "../Tasks/TaskBlock";
import { nanoid } from "nanoid";
import {
  useChecklistsActions,
  useCuttinboardLocation,
  useDailyChecklistsData,
} from "@cuttinboard-solutions/cuttinboard-library";
import usePageTitle from "../../hooks/usePageTitle";
import ErrorPage from "../../shared/molecules/PageError";
import {
  getChecklistsSummary,
  IChecklist,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";
import EmptyExtended from "../../shared/molecules/EmptyExtended";

export default () => {
  usePageTitle("Daily Checklists");
  const { t } = useTranslation();
  const { role } = useCuttinboardLocation();
  const {
    checklistGroup,
    checklistsArray,
    resetAllTasks,
    addChecklist,
    reorderChecklists,
    addChecklistTask,
    removeChecklist,
    updateChecklistTask,
    changeChecklistTaskStatus,
    removeChecklistTask,
    updateChecklists,
    reorderChecklistTask,
  } = useChecklistsActions("dailyChecklists");
  const scrollBottomTarget = useRef<HTMLDivElement>(null);

  const { loading, error } = useDailyChecklistsData();

  const canWrite = useMemo(() => role <= RoleAccessLevels.MANAGER, [role]);

  const getSummaryText = useMemo(() => {
    if (!checklistGroup) {
      return "0/0 tasks completed";
    }
    const summary = getChecklistsSummary(checklistGroup);
    const total = summary.total;
    const completed = summary.completed;
    return `${completed}/${total} ${t("tasks completed")}`;
  }, [checklistGroup, t]);

  const addBlock = () => {
    addChecklist(nanoid());
    scrollBottomTarget.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  const reorderItem = async (
    element: IChecklist,
    sourceIndex: number,
    targetIndex: number
  ) => {
    if (!checklistGroup) {
      return;
    }
    reorderChecklists(element.id, targetIndex);
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPage error={new Error(error)} />;
  }

  return (
    <Layout.Content
      css={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <GrayPageHeader
        title={t("Daily Checklists")}
        subTitle={getSummaryText}
        extra={
          canWrite && (
            <Space>
              <Button
                onClick={addBlock}
                icon={<PlusCircleOutlined />}
                type="primary"
              >
                {t("New Task List")}
              </Button>
              <Button onClick={resetAllTasks} icon={<ClearOutlined />} danger>
                {t("Clear All")}
              </Button>
            </Space>
          )
        }
      />

      <Layout.Content
        css={{ display: "flex", flexDirection: "column", height: "100%" }}
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
            <Space direction="vertical" css={{ display: "flex" }}>
              {checklistsArray.length > 0 && checklistGroup ? (
                <DraggableList<IChecklist>
                  dataSource={checklistsArray}
                  renderItem={(checklist, i, isDragging) => (
                    <TaskBlock
                      key={i}
                      section={checklist}
                      sectionId={checklist.id}
                      canManage={canWrite}
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
                <EmptyExtended
                  descriptions={[
                    "Cultivate a strong culture by creating a systemic routine that all the team follows everyday",
                    "Increase efficiency by streamlining processes and reducing the need for paper checklists",
                    "Enhance overall customer experience by ensuring that standards are consistently met",
                  ]}
                  description={
                    <span>
                      {t("No tasks found")}
                      {". "}
                      <a onClick={addBlock}>{t("Create one")}</a> {t("or")}{" "}
                      <a
                        href="https://www.cuttinboard.com/help/tasks-app"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("learn more")}
                      </a>
                    </span>
                  }
                />
              )}
            </Space>
          </div>
          <div ref={scrollBottomTarget} css={{ height: 50 }} />
        </div>
      </Layout.Content>
    </Layout.Content>
  );
};
