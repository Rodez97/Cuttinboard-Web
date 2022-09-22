import React, { useCallback, useLayoutEffect } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import ConversationsMain from "./ConversationsMain";
import ConvManageMembers from "./ConvManageMembers";
import { useConversations } from "@cuttinboard-solutions/cuttinboard-library/services";
import ManageBase from "../../components/ManageApp/ManageBase";
import {
  Chat,
  Conversation,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { recordError } from "../../utils/utils";
import { PrivacyLevel } from "@cuttinboard-solutions/cuttinboard-library/utils";
import BaseInfo from "../../components/ManageApp/BaseInfo";
import { Button, Result } from "antd";
import { useTranslation } from "react-i18next";

function ConversationsRoutes() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    selectedChat,
    createConversation,
    editConversation,
    deleteConversation,
    setChatId,
  } = useConversations();

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

  const edit = async (convData: Conversation) => {
    try {
      await editConversation(convData);
    } catch (error) {
      recordError(error);
    }
  };

  const deleteConv = useCallback(async () => {
    try {
      await deleteConversation();
    } catch (error) {
      recordError(error);
    }
  }, [selectedChat]);

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
          <Route
            index
            element={
              <BaseInfo
                privacyLevel={selectedChat.privacyLevel}
                positions={
                  selectedChat.privacyLevel === PrivacyLevel.POSITIONS
                    ? selectedChat.positions
                    : []
                }
                hostId={selectedChat.hostId}
                name={selectedChat.name}
                description={selectedChat.description}
                members={
                  selectedChat.privacyLevel === PrivacyLevel.PRIVATE
                    ? selectedChat.members
                    : []
                }
                deleteApp={deleteConv}
              />
            }
          />
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
