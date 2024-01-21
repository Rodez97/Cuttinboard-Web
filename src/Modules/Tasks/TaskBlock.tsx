/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { useTranslation } from "react-i18next";
import Tasklist from "../../shared/organisms/Tasklist";
import {
  Button,
  Collapse,
  Input,
  Modal,
  Tag,
  Tooltip,
  Typography,
} from "antd/es";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { GrayPageHeader } from "../../shared";
import { getTasksArray, IChecklist, ITask } from "@rodez97/types-helpers";
import { logAnalyticsEvent } from "utils/analyticsHelpers";

interface TasksSectionProps {
  sectionId: string;
  section: IChecklist;
  canManage: boolean;
  isDragging: boolean;
  onAddTask: (checklistKey: string, id: string, name: string) => void;
  onRemoveChecklist: (checklistKey: string) => void;
  onRenameTask: (checklistKey: string, taskKey: string, name: string) => void;
  onTaskStatusChange: (
    checklistKey: string,
    taskKey: string,
    newStatus: boolean
  ) => void;
  onRemoveTask: (checklistKey: string, taskKey: string) => void;
  onRename: (
    checklistKey: string,
    newData: {
      name: string;
    }
  ) => void;
  onReorderTasks: (
    checklistKey: string,
    taskKey: string,
    toIndex: number
  ) => void;
}

export default ({
  sectionId,
  section,
  canManage,
  isDragging,
  onAddTask,
  onRemoveChecklist,
  onRenameTask,
  onTaskStatusChange,
  onRemoveTask,
  onRename,
  onReorderTasks,
}: TasksSectionProps) => {
  const { t } = useTranslation();
  const [newTaskName, setNewTaskName] = useState("");
  const [activeKey, setActiveKey] = useState<string | string[] | undefined>([
    "1",
  ]);
  const tasksArray = useMemo(() => getTasksArray(section), [section]);

  const handleAddTask = (name: string = newTaskName) => {
    if (name && canManage) {
      onAddTask(sectionId, nanoid(), name);
    }
    setNewTaskName("");
  };

  const handleDeleteTodoCard = () => {
    Modal.confirm({
      title: t("Are you sure you want to delete this Task List?"),
      icon: <ExclamationCircleOutlined />,
      onOk() {
        onRemoveChecklist(sectionId);
      },
    });
  };

  const getSummary = useMemo(() => {
    if (!section.tasks) {
      return {
        color: "error",
        text: `0/0`,
      };
    }

    const total = Object.keys(section.tasks).length;
    const completed = Object.values(section.tasks).filter(
      (task) => task.status
    ).length;
    return {
      color: completed === total ? "success" : "error",
      text: `${completed}/${total}`,
    };
  }, [section.tasks]);

  const handleTaskNameChange = (task: ITask, newName: string) => {
    onRenameTask(sectionId, task.id, newName);
  };

  const handleTaskChange = (task: ITask, newStatus: boolean) => {
    onTaskStatusChange(sectionId, task.id, newStatus);
  };

  const handleRemoveTask = (task: ITask) => {
    if (canManage) {
      onRemoveTask(sectionId, task.id);
    }
  };

  const updateChecklistName = (newName: string) => {
    onRename(sectionId, { name: newName });

    logAnalyticsEvent("checklist_renamed", { newName });
  };

  const reorderItem = async (
    element: ITask,
    sourceIndex: number,
    targetIndex: number
  ) => {
    if (!section) {
      return;
    }
    onReorderTasks(sectionId, element.id, targetIndex);

    logAnalyticsEvent("checklist_reorder");
  };

  return (
    <GrayPageHeader
      className="task-block-header"
      title={
        <Typography.Title
          level={4}
          editable={canManage ? { onChange: updateChecklistName } : false}
          ellipsis={{
            tooltip: section.name,
          }}
        >
          {section.name}
        </Typography.Title>
      }
      extra={
        canManage && (
          <Tooltip key="delete" title={t("Delete")}>
            <Button
              danger
              type="link"
              onClick={handleDeleteTodoCard}
              icon={<DeleteOutlined />}
            />
          </Tooltip>
        )
      }
    >
      <Collapse
        ghost
        activeKey={isDragging ? undefined : activeKey}
        onChange={setActiveKey}
      >
        <Collapse.Panel
          header={t("Tasks")}
          key="1"
          extra={
            <Tag
              key="tasksSummary"
              icon={<CheckCircleOutlined />}
              color={getSummary.color}
            >
              {getSummary.text}
            </Tag>
          }
        >
          {canManage && (
            <Input
              placeholder={t("Add a task")}
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyDown={(e) => {
                if (e.code === "Enter") {
                  e.preventDefault();
                  handleAddTask();
                  e.stopPropagation();
                }
              }}
              addonAfter={
                <PlusCircleOutlined onClick={() => handleAddTask()} />
              }
              hidden={!canManage}
              css={{ marginBottom: 20 }}
            />
          )}
          <Tasklist
            tasks={tasksArray}
            canRemove={canManage}
            onRemove={handleRemoveTask}
            onChange={handleTaskChange}
            onTaskNameChange={handleTaskNameChange}
            onReorder={reorderItem}
          />
        </Collapse.Panel>
      </Collapse>
    </GrayPageHeader>
  );
};
