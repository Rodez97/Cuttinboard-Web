import React, { useLayoutEffect } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import ConversationsMain from "./ConversationsMain";
import ConvManageMembers from "./ConvManageMembers";
import { useConversations } from "@cuttinboard-solutions/cuttinboard-library/services";
import ManageBase from "../../components/ManageApp/ManageBase";
import {
  Conversation,
  IConversation,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { recordError } from "../../utils/utils";
import { Button, Result } from "antd";
import { useTranslation } from "react-i18next";
import ConvDetails from "./ConvDetails";

function ConversationsRoutes() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { selectedChat, createConversation, setChatId, canManageApp } =
    useConversations();

  useLayoutEffect(() => {
    setChatId(boardId);
  }, [boardId]);

  const create = async (newConvData: Conversation) => {
    try {
      await createConversation(newConvData);
    } catch (error) {
      recordError(error);
    }
  };

  const edit = async (
    convData: Pick<IConversation, "name" | "description" | "positions">
  ) => {
    if (!canManageApp) {
      return;
    }
    try {
      await selectedChat.update(convData);
    } catch (error) {
      recordError(error);
    }
  };

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
            element={
              <ManageBase
                title="Edit Conversation"
                create={create}
                edit={edit}
                baseApp={selectedChat}
              />
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default ConversationsRoutes;
