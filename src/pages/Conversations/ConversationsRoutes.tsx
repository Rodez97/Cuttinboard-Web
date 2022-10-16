import React, { useLayoutEffect } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import ConversationsMain from "./ConversationsMain";
import ConvManageMembers from "./ConvManageMembers";
import { useConversations } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Button, Result } from "antd";
import { useTranslation } from "react-i18next";
import ConvDetails from "./ConvDetails";
import ManageConversation from "./ManageConversation";

function ConversationsRoutes() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { selectedChat, setChatId } = useConversations();

  useLayoutEffect(() => {
    setChatId(boardId);
    return () => {
      setChatId(null);
    };
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
        <Route index element={<ConversationsMain />} />
        <Route path="members/*" element={<ConvManageMembers />} />
        <Route path="details">
          <Route index element={<ConvDetails />} />
          <Route
            path="edit"
            element={<ManageConversation baseConversation={selectedChat} />}
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default ConversationsRoutes;
