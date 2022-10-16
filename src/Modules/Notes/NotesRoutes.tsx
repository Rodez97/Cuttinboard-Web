import { useCuttinboardModule } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Button, Result } from "antd";
import React, { useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import ManageModule from "../ManageApp/ManageModule";
import ModuleInfo from "../ManageApp/ModuleInfo";
import ModuleManageMembers from "../ManageApp/ModuleManageMembers";
import NotesMain from "./NotesMain";

function NotesRoutes() {
  const { boardId } = useParams();
  const { selectedApp, setSelected } = useCuttinboardModule();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useLayoutEffect(() => {
    setSelected(boardId);
    return () => {
      setSelected(null);
    };
  }, [boardId]);

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
        <Route index element={<NotesMain />} />
        <Route path="members/*" element={<ModuleManageMembers />} />
        <Route path="details">
          <Route index element={<ModuleInfo />} />
          <Route path="edit" element={<ManageModule />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default NotesRoutes;
