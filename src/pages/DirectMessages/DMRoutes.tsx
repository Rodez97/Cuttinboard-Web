import React, { useLayoutEffect, useMemo } from "react";
import DMMain from "./DMMain";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  useDMs,
  useEmployeesList,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { Button, Result } from "antd";
import { useTranslation } from "react-i18next";
import DMDetails from "./DMDetails";
import { Auth } from "@cuttinboard-solutions/cuttinboard-library/firebase";

function DMRoutes() {
  const { t } = useTranslation();
  const { boardId, locationId } = useParams();
  const { setChatId, selectedChat } = useDMs();
  const navigate = useNavigate();
  const { getEmployees } = locationId != null && useEmployeesList();

  useLayoutEffect(() => {
    setChatId(boardId);
  }, [boardId]);

  const recipient = useMemo(() => {
    if (!selectedChat) {
      return null;
    }
    return {
      employee:
        locationId != null
          ? getEmployees.find((e) => e.id === selectedChat.recipient.id)
          : undefined,
      userId: selectedChat.recipient.id,
    };
  }, [selectedChat, getEmployees, locationId]);

  if (!selectedChat || !recipient) {
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
        <Route path="details" element={<DMDetails {...recipient} />} />
      </Route>
    </Routes>
  );
}

export default DMRoutes;
