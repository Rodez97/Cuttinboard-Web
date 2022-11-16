/** @jsx jsx */
import { jsx } from "@emotion/react";
import { orderBy } from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { EmptyMainModule, PageError, PageLoading } from "../../components";
import { useDisclose } from "../../hooks";
import ManageModuleDialog, {
  useManageModule,
} from "../ManageApp/ManageModuleDialog";
import ModuleInfoDialog from "../ManageApp/ModuleInfoDialog";
import ModuleManageMembers from "../ManageApp/ModuleManageMembers";
import ManageTaskBlock, { ManageTaskBlockRef } from "./ManageTaskBlock";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { query, where } from "firebase/firestore";
import { Auth } from "@cuttinboard-solutions/cuttinboard-library/firebase";

function TasksMain() {
  const { t } = useTranslation();
  const [{ order, index, searchQuery }, setOrderData] = useState<{
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
  const [infoOpen, openInfo, closeInfo] = useDisclose();
  const [manageMembersOpen, openManageMembers, closeManageMembers] =
    useDisclose();
  const { baseRef, editModule } = useManageModule();
  const manageTaskBlockRef = useRef<ManageTaskBlockRef>(null);
  const [todoCards, loading, error] = useCollectionData<Todo>(
    canManage
      ? selectedApp?.contentRef.withConverter(Todo.Converter)
      : selectedApp &&
          query(
            selectedApp.contentRef,
            where(`assignedTo.id`, "==", Auth.currentUser.uid)
          ).withConverter(Todo.Converter)
  );

  const handleCreateTaskBlock = () => {
    manageTaskBlockRef.current?.openNew();
  };

  const handleEditTaskBlock = (todo: Todo) => {
    manageTaskBlockRef.current?.openEdit(todo);
  };

  useEffect(() => {
    removeBadge("task", selectedApp.id);
    return () => {
      removeBadge("task", selectedApp.id);
    };
  }, []);

  const getOrderedTasks = useMemo(() => {
    let ordered: Todo[] = [];

    switch (index) {
      case 0:
        ordered = orderBy(todoCards, "createdAt", order);
        break;
      case 1:
        ordered = orderBy(todoCards, "name", order);
        break;
      case 2:
        ordered = orderBy(todoCards, "dueDate", order);
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
          order
        );
        break;

      default:
        ordered = todoCards;
        break;
    }

    return matchSorter(ordered, searchQuery, {
      keys: ["name"],
      sorter: (items) => items,
    });
  }, [todoCards, index, order, searchQuery]);

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError error={error} />;
  }

  return (
    <Layout.Content
      css={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <GrayPageHeader
        backIcon={<InfoCircleOutlined />}
        onBack={openInfo}
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
            onClick={openManageMembers}
            icon={<TeamOutlined />}
          >
            {t("Members")}
          </Button>,
        ]}
      />
      <ToolBar
        options={["Creation", "Name", "Due date", "Completed"]}
        index={index}
        order={order}
        onChageOrder={(order) => setOrderData((prev) => ({ ...prev, order }))}
        onChange={(index) => setOrderData((prev) => ({ ...prev, index }))}
        searchQuery={searchQuery}
        onChangeSearchQuery={(sq) =>
          setOrderData((prev) => ({ ...prev, searchQuery: sq }))
        }
      />
      <br />
      <div
        css={{
          display: "flex",
          flexDirection: "column",
          padding: 20,
          overflow: "auto",
        }}
      >
        <Space
          css={{
            minWidth: 300,
            maxWidth: 800,
            margin: "auto",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
          }}
        >
          {getOrderedTasks.length ? (
            getOrderedTasks.map((todo) => (
              <TaskBlock
                key={todo.id}
                taskBlock={todo}
                onEdit={() => handleEditTaskBlock(todo)}
              />
            ))
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
        </Space>
      </div>
      <ManageTaskBlock ref={manageTaskBlockRef} />
      <ManageModuleDialog ref={baseRef} moduleName="Notes Stack" />
      <ModuleInfoDialog
        open={infoOpen}
        onCancel={closeInfo}
        onEdit={() => {
          closeInfo();
          editModule(selectedApp);
        }}
      />
      <ModuleManageMembers
        open={manageMembersOpen}
        onCancel={closeManageMembers}
      />
    </Layout.Content>
  );
}

export default TasksMain;
