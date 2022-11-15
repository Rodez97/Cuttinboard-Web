import { Timestamp } from "firebase/firestore";
import React, { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { useTranslation } from "react-i18next";
import SimpleTodo from "../../components/SimpleTodo";
import {
  Checklist_Section,
  LocationCheckList,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { recordError } from "../../utils/utils";
import { Button, Collapse, Input, Modal, Tag, Tooltip } from "antd";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { GrayPageHeader } from "../../components/PageHeaders";

interface TasksSectionProps {
  sectionId: string;
  section: Checklist_Section;
  rootChecklist: LocationCheckList;
  onEdit: () => void;
  canManage: boolean;
}

function TasksSection({
  sectionId,
  section,
  rootChecklist,
  onEdit,
  canManage,
}: TasksSectionProps) {
  const { t } = useTranslation();
  const [newTaskName, setNewTaskName] = useState("");

  const handleTaskChange = async (key: string, status: boolean) => {
    try {
      await rootChecklist.changeTaskStatus(sectionId, key, status);
    } catch (error) {
      recordError(error);
    }
  };

  const handleAddTask = async () => {
    if (newTaskName && canManage) {
      const task = {
        name: newTaskName,
        status: false,
        createdAt: Timestamp.now(),
      };
      setNewTaskName("");
      try {
        await rootChecklist.addTask(sectionId, nanoid(), task);
      } catch (error) {
        recordError(error);
      }
    }
  };

  const handleRemoveTask = async (taskId: string) => {
    if (canManage) {
      try {
        await rootChecklist.removeTask(sectionId, taskId);
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
          await rootChecklist.removeSection(sectionId);
        } catch (error) {
          recordError(error);
        }
      },
      onCancel() {},
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
  }, [rootChecklist, sectionId]);

  const handleTaskNameChange = async (taskId: string, newName: string) => {
    try {
      await rootChecklist.updateTask(sectionId, taskId, { name: newName });
    } catch (error) {
      recordError(error);
    }
  };

  // Show Description Modal if there is one
  const showDescriptionModal = () => {
    if (section.description) {
      Modal.info({
        title: section.name,
        content: <p>{section.description}</p>,
        onOk() {},
      });
    } else {
      // If there is no description, alert the user
      Modal.info({
        title: section.name,
        content: <p>{t("There is no description for this task list")}</p>,
        onOk() {},
      });
    }
  };

  const handleEdit = () => {
    onEdit();
  };

  return (
    <GrayPageHeader
      ghost={false}
      backIcon={false}
      title={section.name}
      tags={[
        <Tag
          key="tasksSummary"
          icon={<CheckCircleOutlined />}
          color={getSummary.color}
        >
          {getSummary.text}
        </Tag>,
      ]}
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
        <Tooltip title={t("Edit")} key="edit">
          <Button
            type="link"
            onClick={handleEdit}
            icon={<EditOutlined />}
            hidden={!canManage}
          />
        </Tooltip>,
        <Button
          key="info"
          icon={<InfoCircleOutlined />}
          onClick={showDescriptionModal}
          type="link"
        />,
      ]}
    >
      <Collapse defaultActiveKey={["1"]} ghost>
        <Collapse.Panel
          header={t("Tasks")}
          key="1"
          extra={section.tag && <Tag color="processing">{section.tag}</Tag>}
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
            addonAfter={<PlusCircleOutlined onClick={handleAddTask} />}
            hidden={!canManage}
          />
          <SimpleTodo
            tasks={section?.tasks}
            canRemove={canManage}
            onRemove={handleRemoveTask}
            onChange={handleTaskChange}
            onTaskNameChange={handleTaskNameChange}
          />
        </Collapse.Panel>
      </Collapse>
    </GrayPageHeader>
  );
}

export default TasksSection;
