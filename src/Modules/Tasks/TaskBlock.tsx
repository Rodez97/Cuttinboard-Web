import { Timestamp } from "firebase/firestore";
import dayjs from "dayjs";
import React, { useState } from "react";
import { nanoid } from "nanoid";
import { useTranslation } from "react-i18next";
import SimpleTodo from "../../components/SimpleTodo";
import { Todo } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Auth } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { useCuttinboardModule } from "@cuttinboard-solutions/cuttinboard-library/services";
import { recordError } from "../../utils/utils";
import { Button, Collapse, Input, Modal, Tag, Tooltip } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { GrayPageHeader } from "../../components/PageHeaders";

interface TaskBlockProps {
  taskBlock: Todo;
  onEdit: () => void;
}

function TaskBlock({ taskBlock, onEdit }: TaskBlockProps) {
  const { t } = useTranslation();
  const [newTaskName, setNewTaskName] = useState("");
  const { canManage } = useCuttinboardModule();

  const handleTaskChange = async (key: string, status: boolean) => {
    if (taskBlock?.assignedTo.id === Auth.currentUser.uid || canManage) {
      try {
        await taskBlock.changeTaskStatus(key, status);
      } catch (error) {
        recordError(error);
      }
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
        await taskBlock.addTask(nanoid(), task);
      } catch (error) {
        recordError(error);
      }
    }
  };

  const handleRemoveTask = async (taskId: string) => {
    if (canManage) {
      try {
        await taskBlock.removeTask(taskId);
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
          await taskBlock.delete();
        } catch (error) {
          recordError(error);
        }
      },
      onCancel() {},
    });
  };

  const handleEdit = () => {
    onEdit();
  };

  return (
    <GrayPageHeader
      ghost={false}
      backIcon={false}
      title={taskBlock?.name}
      subTitle={taskBlock?.description}
      tags={[
        <Tag
          key="tasksSummary"
          icon={<CheckCircleOutlined />}
          color={
            taskBlock.tasksSummary.done === taskBlock.tasksSummary.total
              ? "success"
              : "error"
          }
        >
          {`${taskBlock.tasksSummary.done}/${taskBlock.tasksSummary.total}`}
        </Tag>,
        taskBlock?.assignedTo && (
          <Tag key="assignedTo" icon={<UserOutlined />}>
            {taskBlock.assignedTo.name}
          </Tag>
        ),
      ]}
      extra={[
        taskBlock?.dueDate && (
          <Tag icon={<CalendarOutlined />}>
            {dayjs(taskBlock.convertedDueDate).format("MMMM D, YYYY, hh:mm a")}
          </Tag>
        ),
        <Tooltip key="delete" title={t("Delete")}>
          <Button
            danger
            type="link"
            onClick={handleDeleteTodoCard}
            icon={<DeleteOutlined />}
            disabled={!canManage}
          />
        </Tooltip>,
        <Tooltip title={t("Edit")} key="edit">
          <Button
            type="link"
            onClick={handleEdit}
            icon={<EditOutlined />}
            disabled={!canManage}
          />
        </Tooltip>,
      ]}
    >
      <Collapse defaultActiveKey={["1"]} ghost>
        <Collapse.Panel header={t("Tasks")} key="1">
          {canManage && (
            <Input
              placeholder={t("Add a task")}
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyDown={(e) => {
                if (e.code === "Enter") {
                  e.preventDefault();
                  handleAddTask();
                }
              }}
              addonAfter={<PlusCircleOutlined onClick={handleAddTask} />}
            />
          )}
          <SimpleTodo
            tasks={taskBlock.tasks}
            canRemove={canManage}
            onRemove={handleRemoveTask}
            onChange={handleTaskChange}
          />
        </Collapse.Panel>
      </Collapse>
    </GrayPageHeader>
  );
}

export default TaskBlock;
