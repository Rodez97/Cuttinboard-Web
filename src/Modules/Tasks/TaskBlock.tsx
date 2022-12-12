/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { useTranslation } from "react-i18next";
import Tasklist from "../../shared/organisms/Tasklist";
import { recordError } from "../../utils/utils";
import {
  Button,
  Collapse,
  Input,
  message,
  Modal,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlusCircleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import {
  Checklist,
  ChecklistGroup,
  Task,
} from "@cuttinboard-solutions/cuttinboard-library/checklist";
import { GrayPageHeader } from "../../shared";

interface TasksSectionProps {
  sectionId: string;
  section: Checklist;
  rootChecklist: ChecklistGroup;
  canManage: boolean;
  isDragging: boolean;
}

export default ({
  sectionId,
  section,
  rootChecklist,
  canManage,
  isDragging,
}: TasksSectionProps) => {
  const { t } = useTranslation();
  const [newTaskName, setNewTaskName] = useState("");
  const [activeKey, setActiveKey] = useState<string | string[] | undefined>([
    "1",
  ]);

  const handleAddTask = async (
    name: string = newTaskName,
    id: string = nanoid()
  ) => {
    if (name && canManage) {
      setNewTaskName("");
      try {
        await section.addTask(id, name);
      } catch (error) {
        recordError(error);
      }
    }
  };

  const handleDeleteTodoCard = async () => {
    Modal.confirm({
      title: t("Are you sure you want to delete this Task List?"),
      icon: <ExclamationCircleOutlined />,

      async onOk() {
        try {
          await rootChecklist.removeChecklist(sectionId);
        } catch (error) {
          recordError(error);
        }
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

  const handleTaskNameChange = async (task: Task, newName: string) => {
    try {
      await task.updateTask(newName);
    } catch (error) {
      recordError(error);
    }
  };

  const handleTaskChange = async (task: Task, newStatus: boolean) => {
    try {
      await task.changeTaskStatus(newStatus);
    } catch (error) {
      recordError(error);
    }
  };

  const handleRemoveTask = async (task: Task) => {
    if (canManage) {
      try {
        await section.removeTask(task.id);
      } catch (error) {
        recordError(error);
      }
    }
  };

  const updateChecklistName = async (newName: string) => {
    try {
      await section.update({ name: newName });
    } catch (error) {
      recordError(error);
    }
  };

  // Prints a list of tasks, only the name, with the logo and the name of the checklist, in the format of a ticket
  const handlePrint = async () => {
    if (section.tasksArray.length === 0) {
      message.error(t("There are no tasks to print"));
      return;
    }
    const printWindow = window.open("", "PRINT");

    printWindow?.document.write(`
      <html>
        <head>
          <title>${section.name}</title>
          <style>
            body {
              font-family: "Roboto", sans-serif;
              font-size: 14px;
            }
            .name {
              font-size: 10px;
              margin-bottom: 5px;
            }
            .logo {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 100%;
            }
            .title {
              text-align: center;
            }
          </style>
        </head>
        <body>
          <h6 class="title">cuttinboard.com</h6>
          <h5 class="title">${section.name}</h5>
          <div>
            ${section.tasksArray
              .map(
                (task) => `
              <p class="name">· ${task.name}</p>
            `
              )
              .join("")}
          </div>
        </body>
      </html>
    `);

    printWindow?.document.close();
    printWindow?.focus();
    printWindow?.print();
    printWindow?.close();
  };

  const reorderItem = async (
    element: Task,
    sourceIndex: number,
    targetIndex: number
  ) => {
    if (!section) {
      return;
    }
    try {
      await section.reorderTasks(element.id, targetIndex);
    } catch (error) {
      recordError(error);
    }
  };

  return (
    <GrayPageHeader
      css={{ marginBottom: 10, width: "100%" }}
      title={
        <Typography.Title
          level={4}
          editable={{ onChange: updateChecklistName }}
        >
          {section.name}
        </Typography.Title>
      }
      extra={[
        <Tooltip key="delete" title={t("Delete")}>
          <Button
            danger
            type="link"
            onClick={handleDeleteTodoCard}
            icon={<DeleteOutlined />}
            hidden={!canManage}
          />
        </Tooltip>,
        <Tooltip title={t("Print Task block")} key="print">
          <Button
            type="link"
            icon={<PrinterOutlined />}
            hidden={!canManage}
            onClick={handlePrint}
          />
        </Tooltip>,
      ]}
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
            addonAfter={<PlusCircleOutlined onClick={() => handleAddTask()} />}
            hidden={!canManage}
            css={{ marginBottom: 20 }}
          />
          <Tasklist
            tasks={section.tasksArray}
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
