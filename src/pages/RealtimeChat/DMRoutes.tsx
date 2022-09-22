import React, { useLayoutEffect } from "react";
import DMMain from "./DMMain";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { useDMs } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Button, Result } from "antd";
import { useTranslation } from "react-i18next";

function DMRoutes() {
  const { t } = useTranslation();
  const { boardId } = useParams();
  const { setChatId, selectedChat } = useDMs();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    setChatId(boardId);
  }, [boardId]);

  if (!selectedChat) {
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
        <Route index element={<DMMain />} />
        <Route path="details" element={<p>Detalles</p>} />
      </Route>
    </Routes>
  );
}

export default DMRoutes;
