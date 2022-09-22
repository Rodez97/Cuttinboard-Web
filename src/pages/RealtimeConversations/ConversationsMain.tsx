/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ChatMain from "components/ChatV2/ChatMain";
import {
  ChatRTDBProvider,
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
  const { selectedChat, canUseApp } = useConversations();
  useEffect(() => {
    removeBadge("conv", selectedChat.id);
    return () => {
      removeBadge("conv", selectedChat.id);
    };
  }, [selectedChat]);

  return (
    <ChatRTDBProvider
      chatType="conversations"
      chatId={selectedChat.id}
      members={selectedChat.members}
    >
      <GrayPageHeader
        backIcon={<InfoCircleOutlined />}
        onBack={() => navigate("details")}
        title={selectedChat.name}
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
        chatId={selectedChat.id}
        canUse={canUseApp}
      />
    </ChatRTDBProvider>
  );
}

export default ConversationsMain;
