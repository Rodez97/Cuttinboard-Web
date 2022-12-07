/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { useTranslation } from "react-i18next";
import SimpleTodo from "../../components/SimpleTodo";
import { recordError } from "../../utils/utils";
import { Button, Collapse, Input, Modal, Tag, Tooltip, Typography } from "antd";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlusCircleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { GrayPageHeader } from "../../components/PageHeaders";
import { useDrop } from "react-dnd";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import {
  Checklist,
  ChecklistGroup,
  RecurringTask,
  Task,
} from "@cuttinboard-solutions/cuttinboard-library/checklist";

interface TasksSectionProps {
  sectionId: string;
  section: Checklist;
  rootChecklist: ChecklistGroup;
  canManage: boolean;
}

function selectBackgroundColor(isActive: boolean, canDrop: boolean) {
  if (isActive) {
    return Colors.Green.Light;
  } else if (canDrop) {
    return Colors.Blue.Light;
  }
}

export default ({
  sectionId,
  section,
  rootChecklist,
  canManage,
}: TasksSectionProps) => {
  const { t } = useTranslation();
  const [newTaskName, setNewTaskName] = useState("");

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

  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: "recurringTask",
      drop: (recurringTask: { id: string; task: RecurringTask }) => {
        console.log("Dropped", recurringTask);
        handleAddTask(recurringTask.task.name, recurringTask.id);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [sectionId, section]
  );

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

  const handleEdit = async (newName: string) => {
    try {
      await section.update({ name: newName });
    } catch (error) {
      recordError(error);
    }
  };

  // Prints a list of tasks, only the name, with the logo and the name of the checklist, in the format of a ticket
  const handlePrint = async () => {
    if (!section.tasks) {
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
            ${Object.values(section.tasks)
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

  return (
    <div ref={drop}>
      <GrayPageHeader
        css={{
          backgroundColor: selectBackgroundColor(isOver, canDrop),
        }}
        ghost={false}
        backIcon={false}
        title={
          <Typography.Title level={4} editable={{ onChange: handleEdit }}>
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
        <Collapse defaultActiveKey={["1"]} ghost>
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
              addonAfter={
                <PlusCircleOutlined onClick={() => handleAddTask()} />
              }
              hidden={!canManage}
            />
            <SimpleTodo
              tasks={section.tasksArray}
              canRemove={canManage}
              onRemove={handleRemoveTask}
              onChange={handleTaskChange}
              onTaskNameChange={handleTaskNameChange}
            />
          </Collapse.Panel>
        </Collapse>
      </GrayPageHeader>
    </div>
  );
};
