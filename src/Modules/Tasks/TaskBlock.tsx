import { deleteDoc, deleteField, setDoc, Timestamp } from "firebase/firestore";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { useTranslation } from "react-i18next";
import SimpleTodo from "../../components/SimpleTodo";
import { Todo } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Auth } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { useCuttinboardModule } from "@cuttinboard-solutions/cuttinboard-library/services";
import { recordError } from "../../utils/utils";
import { Button, Col, Collapse, Input, Modal, Row, Tag, Tooltip } from "antd";
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
  const [anchorElMenu, setAnchorElMenu] = useState<Element | null>(null);
  const [newTaskName, setNewTaskName] = useState("");
  const [tasksCollapsed, setTasksCollapsed] = useState(true);
  const { canManage } = useCuttinboardModule();

  const handleMoreOptionsClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    setAnchorElMenu(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorElMenu(null);
  };

  const handleTaskChange = async (key: string, status: boolean) => {
    if (
      taskBlock?.tasks[key] &&
      (taskBlock?.assignedTo.id === Auth.currentUser.uid || canManage)
    ) {
      try {
        await setDoc(
          taskBlock.docRef,
          { tasks: { [key]: { ...taskBlock.tasks[key], status } } },
          { merge: true }
        );
      } catch (error) {
        recordError(error);
      }
    }
  };

  const handleAddTask = async () => {
    if (newTaskName && canManage) {
      const task = {
        [nanoid()]: {
          name: newTaskName,
          status: false,
          createdAt: Timestamp.now(),
        },
      };
      setNewTaskName("");
      try {
        await setDoc(
          taskBlock.docRef,
          {
            tasks: task,
          },
          { merge: true }
        );
      } catch (error) {
        recordError(error);
      }
    }
  };

  const handleRemoveTask = async (taskId: string) => {
    if (taskBlock.tasks && canManage) {
      try {
        await setDoc(
          taskBlock.docRef,
          {
            tasks: {
              [taskId]: deleteField(),
            },
          },
          { merge: true }
        );
      } catch (error) {
        recordError(error);
      }
    }
  };

  const getTasksSummary = useMemo(() => {
    if (taskBlock.tasks) {
      const doneTasks = Object.values(taskBlock.tasks).filter(
        (task) => task.status
      ).length;
      const totalTasks = Object.values(taskBlock.tasks).length;
      return (
        <Tag
          key="tasksSummary"
          icon={<CheckCircleOutlined />}
          color={doneTasks === totalTasks ? "success" : "error"}
        >
          {`${doneTasks}/${totalTasks}`}
        </Tag>
      );
    }
  }, [taskBlock.tasks]);

  const handleDeleteTodoCard = async () => {
    Modal.confirm({
      title: t("Are you sure you want to delete this Task List?"),
      icon: <ExclamationCircleOutlined />,

      async onOk() {
        try {
          await deleteDoc(taskBlock.docRef);
        } catch (error) {
          recordError(error);
        }
        handleCloseMenu();
      },
      onCancel() {},
    });
  };

  const handleEdit = () => {
    onEdit();
    handleCloseMenu();
  };

  return (
    <Row justify="center" style={{ margin: "20px 0px" }}>
      <Col xs={24} md={20} lg={16} xl={12}>
        <GrayPageHeader
          ghost={false}
          backIcon={false}
          title={taskBlock?.name}
          subTitle={taskBlock?.description}
          tags={[
            getTasksSummary,
            taskBlock?.assignedTo && (
              <Tag key="assignedTo" icon={<UserOutlined />}>
                {taskBlock.assignedTo.name}
              </Tag>
            ),
          ]}
          extra={[
            taskBlock?.dueDate && (
              <Tag icon={<CalendarOutlined />}>
                {dayjs(taskBlock.dueDate.toDate()).format(
                  "MMMM D, YYYY, hh:mm a"
                )}
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
      </Col>
    </Row>
  );
}

export default TaskBlock;
