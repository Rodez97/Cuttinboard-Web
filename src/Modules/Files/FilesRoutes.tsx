import { useCuttinboardModule } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Button, Result } from "antd";
import React, { useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import ManageModule from "../ManageApp/ManageModule";
import ModuleInfo from "../ManageApp/ModuleInfo";
import ModuleManageMembers from "../ManageApp/ModuleManageMembers";
import FilesMain from "./FilesMain";

function FilesRoutes() {
  const { boardId } = useParams();
  const { selectedApp, setSelected } = useCuttinboardModule();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useLayoutEffect(() => {
    setSelected(boardId);
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
        <Route index element={<FilesMain />} />
        <Route path="members/*" element={<ModuleManageMembers />} />
        <Route path="details">
          <Route index element={<ModuleInfo />} />
          <Route
            path="edit"
            element={<ManageModule title="Edit Drawer" edit />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default FilesRoutes;
