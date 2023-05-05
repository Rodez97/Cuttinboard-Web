/** @jsx jsx */
import { jsx } from "@emotion/react";
import { ClearOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, Layout, Modal, Space } from "antd";
import { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { GrayPageHeader, DraggableList, LoadingPage } from "../../shared";
import TaskBlock from "../Tasks/TaskBlock";
import { nanoid } from "nanoid";
import {
  useChecklist,
  useCuttinboardLocation,
} from "@cuttinboard-solutions/cuttinboard-library";
import ErrorPage from "../../shared/molecules/PageError";
import {
  getChecklistsSummary,
  IChecklist,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";
import EmptyExtended from "../../shared/molecules/EmptyExtended";

export default function GlobalChecklistMain() {
  const { t } = useTranslation();
  const { role } = useCuttinboardLocation();
  const {
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
    resetAllChecklistTasks,
  } = useChecklist();
  const scrollBottomTarget = useRef<HTMLDivElement>(null);

  const canWrite = useMemo(() => role <= RoleAccessLevels.MANAGER, [role]);

  const getSummaryText = useMemo(() => {
    if (!checklistGroup) {
      return t("{{0}} task(s) completed", { 0: "0/0" });
    }
    const summary = getChecklistsSummary(checklistGroup);
    const total = summary.total;
    const completed = summary.completed;
    return t("{{0}} task(s) completed", { 0: `${completed}/${total}` });
  }, [checklistGroup, t]);

  const addBlock = () => {
    addNewChecklist(nanoid());
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
    reorderChecklistsPosition(element.id, targetIndex);
  };

  const resetTasks = () => {
    Modal.confirm({
      title: t("Are you sure you want to clear all tasks?"),
      content: t(
        "This will reset all tasks in this list. This action cannot be undone"
      ),
      okText: t("Clear All"),
      cancelText: t("Cancel"),
      onOk: resetAllChecklistTasks,
    });
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPage error={error} />;
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
              <Button onClick={resetTasks} icon={<ClearOutlined />} danger>
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
                        href="http://www.cuttinboard.com/help/daily-checklists"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("Learn more")}
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
}
