/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ChatMain from "../../ChatComponents/ChatMain";
import {
  ConversationMessagesProvider,
  useConversations,
  useNotificationsBadges,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { Button } from "antd";
import { GrayPageHeader } from "../../components/PageHeaders";
import { InfoCircleOutlined, TeamOutlined } from "@ant-design/icons";

function ConversationsMain() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { removeBadge } = useNotificationsBadges();
  const { selectedConversation, canUse } = useConversations();
  useEffect(() => {
    removeBadge("conv", selectedConversation.id);
    return () => {
      removeBadge("conv", selectedConversation.id);
    };
  }, [selectedConversation]);

  return (
    <ConversationMessagesProvider chatId={selectedConversation.id}>
      <GrayPageHeader
        backIcon={<InfoCircleOutlined />}
        onBack={() => navigate("details")}
        title={selectedConversation.name}
        extra={[
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
      <ChatMain
        type="conversations"
        chatId={selectedConversation.id}
        canUse={canUse}
      />
    </ConversationMessagesProvider>
  );
}

export default ConversationsMain;
