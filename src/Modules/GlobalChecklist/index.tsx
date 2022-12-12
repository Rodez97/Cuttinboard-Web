/** @jsx jsx */
import { jsx } from "@emotion/react";
import { ClearOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, Empty, Layout, Space } from "antd";
import { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";
import {
  GrayPageHeader,
  PageError,
  LoadingPage,
  DraggableList,
} from "../../shared";
import TaskBlock from "../Tasks/TaskBlock";
import { nanoid } from "nanoid";
import {
  Checklist,
  useDailyChecklist,
} from "@cuttinboard-solutions/cuttinboard-library/checklist";

export default () => {
  const { t } = useTranslation();
  const {
    checklistData,
    loading,
    error,
    canWrite,
    resetTasks,
    checklistsArray,
    addChecklist,
  } = useDailyChecklist();
  const scrollBottomTarget = useRef<HTMLDivElement>(null);

  const reset = async () => {
    try {
      await resetTasks();
    } catch (error) {
      recordError(error);
    }
  };

  const getSummaryText = useMemo(() => {
    if (!checklistData) {
      return "0/0 tasks completed";
    }
    const total = checklistData.summary.total;
    const completed = checklistData.summary.completed;
    return `${completed}/${total} ${t("tasks completed")}`;
  }, [checklistData, t]);

  const addBlock = async () => {
    try {
      await addChecklist(nanoid());
      scrollBottomTarget.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    } catch (error) {
      recordError(error);
    }
  };

  const reorderItem = async (
    element: Checklist,
    sourceIndex: number,
    targetIndex: number
  ) => {
    if (!checklistData) {
      return;
    }
    try {
      await checklistData.reorderChecklists(element.id, targetIndex);
    } catch (error) {
      recordError(error);
    }
  };

  if (error) {
    return <PageError error={error} />;
  }

  if (loading) {
    return <LoadingPage />;
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
              <Button onClick={reset} icon={<ClearOutlined />} danger>
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
              {checklistsArray.length > 0 && checklistData ? (
                <DraggableList<Checklist>
                  dataSource={checklistsArray}
                  renderItem={(checklist, i, isDragging) => (
                    <TaskBlock
                      key={i}
                      section={checklist}
                      sectionId={checklist.id}
                      canManage={canWrite}
                      rootChecklist={checklistData}
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
                      <a onClick={addBlock}>Create one</a> or{" "}
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
          <div ref={scrollBottomTarget} css={{ height: 50 }} />
        </div>
      </Layout.Content>
    </Layout.Content>
  );
};
