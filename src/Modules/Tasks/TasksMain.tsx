/** @jsx jsx */
import { jsx } from "@emotion/react";
import { orderBy } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TaskBlock from "./TaskBlock";
import { useTranslation } from "react-i18next";
import {
  useCuttinboardModule,
  useNotificationsBadges,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { Todo } from "@cuttinboard-solutions/cuttinboard-library/models";
import ToolBar from "../ToolBar";
import { Button, Layout, Space } from "antd";
import { GrayPageHeader } from "../../components/PageHeaders";
import {
  InfoCircleOutlined,
  PlusOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { matchSorter } from "match-sorter";
import { EmptyMainModule } from "../Notes/EmptyMainModule";

function TasksMain({ todoCards }: { todoCards: Todo[] }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [orderData, setOrderData] = useState<{
    index: number;
    order: "desc" | "asc";
    searchQuery?: string;
  }>({
    index: 0,
    order: "asc",
    searchQuery: "",
  });
  const { selectedApp, canManage } = useCuttinboardModule();
  const { removeBadge } = useNotificationsBadges();

  const handleCreateTaskBlock = () => {
    navigate("new-todo");
  };

  useEffect(() => {
    return () => {
      if (selectedApp?.id) removeBadge("task", selectedApp.id);
    };
  }, [selectedApp]);

  const getOrderedTasks = useMemo(() => {
    let ordered: Todo[] = [];

    switch (orderData.index) {
      case 0:
        ordered = orderBy(todoCards, "createdAt", orderData.order);
        break;
      case 1:
        ordered = orderBy(todoCards, "name", orderData.order);
        break;
      case 2:
        ordered = orderBy(todoCards, "dueDate", orderData.order);
        break;
      case 3:
        ordered = orderBy(
          todoCards,
          (todo) => {
            const doneTasks = Object.values(todo.tasks).filter(
              (task) => task.status
            ).length;
            const totalTasks = Object.values(todo.tasks).length;
            return doneTasks / totalTasks;
          },
          orderData.order
        );
        break;

      default:
        ordered = todoCards;
        break;
    }

    return matchSorter(ordered, orderData.searchQuery, {
      keys: ["name"],
    });
  }, [todoCards, orderData]);

  return (
    <Layout.Content
      css={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <GrayPageHeader
        backIcon={<InfoCircleOutlined />}
        onBack={() => navigate("details")}
        title={selectedApp.name}
        extra={[
          <Button
            key="newTasksList"
            disabled={!canManage}
            onClick={handleCreateTaskBlock}
            icon={<PlusOutlined />}
            type="dashed"
          >
            {t("New Task List")}
          </Button>,
          <Button
            key="members"
            type="primary"
            onClick={() => navigate(`members`)}
            icon={<TeamOutlined />}
          >
            {t("Members")}
          </Button>,
        ]}
      />
      <ToolBar
        options={["Creation", "Name", "Due date", "Completed"]}
        index={orderData.index}
        order={orderData.order}
        onChageOrder={(order) => setOrderData((prev) => ({ ...prev, order }))}
        onChange={(index) => setOrderData((prev) => ({ ...prev, index }))}
        searchQuery={orderData.searchQuery}
        onChangeSearchQuery={(sq) =>
          setOrderData((prev) => ({ ...prev, searchQuery: sq }))
        }
      />
      <br />
      {getOrderedTasks.length ? (
        <Space direction="vertical">
          {getOrderedTasks?.map((todo) => (
            <TaskBlock
              key={todo.id}
              taskBlock={todo}
              onEdit={() => navigate(`edit-todo/${todo.id}`)}
            />
          ))}
        </Space>
      ) : (
        <EmptyMainModule
          description={
            <span>
              No tasks. <a onClick={handleCreateTaskBlock}>Create one</a> or{" "}
              <a
                href="https://www.cuttinboard.com/help/understanding-the-notes-app"
                target="_blank"
              >
                learn more.
              </a>
            </span>
          }
        />
      )}
    </Layout.Content>
  );
}

export default TasksMain;
