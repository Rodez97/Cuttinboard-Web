import { Auth } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { Todo } from "@cuttinboard-solutions/cuttinboard-library/models";
import { useCuttinboardModule } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Button, Result } from "antd";
import { query, where } from "firebase/firestore";
import React, { useLayoutEffect } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useTranslation } from "react-i18next";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import PageError from "../../components/PageError";
import PageLoading from "../../components/PageLoading";
import ManageModule from "../ManageApp/ManageModule";
import ModuleInfo from "../ManageApp/ModuleInfo";
import ModuleManageMembers from "../ManageApp/ModuleManageMembers";
import ManageTodo from "./ManageTodo";
import TasksMain from "./TasksMain";

function TasksRoutes() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { selectedApp, setSelected, canManage, moduleContentRef } =
    useCuttinboardModule();
  useLayoutEffect(() => {
    setSelected(boardId);
  }, [boardId]);
  const [todoCards, loading, error] = useCollectionData<Todo>(
    canManage
      ? moduleContentRef?.withConverter(Todo.Converter)
      : moduleContentRef &&
          query(
            moduleContentRef,
            where(`assignedTo.id`, "==", Auth.currentUser.uid)
          ).withConverter(Todo.Converter)
  );

  if (loading) {
    return <PageLoading />;
  }
  if (error) {
    return <PageError error={error} />;
  }

  if (!selectedApp) {
    return (
      <Result
        status="404"
        title="404"
        subTitle={t("Sorry, the page you visited does not exist.")}
        extra={
          <Button type="primary" onClick={() => navigate(-1)}>
            {t("Go back")}
          </Button>
        }
      />
    );
  }

  return (
    <Routes>
      <Route path="/">
        <Route index element={<TasksMain todoCards={todoCards} />} />
        <Route path="members/*" element={<ModuleManageMembers />} />
        <Route path="details">
          <Route index element={<ModuleInfo />} />
          <Route
            path="edit"
            element={<ManageModule title="Edit to-do board" edit />}
          />
        </Route>
        <Route
          path="new-todo/*"
          element={<ManageTodo title={t("New Task List")} todos={todoCards} />}
        />
        <Route
          path="edit-todo/:todoId/*"
          element={<ManageTodo title={t("Edit Task List")} todos={todoCards} />}
        />
      </Route>
    </Routes>
  );
}

export default TasksRoutes;
