import { UserOutlined } from "@ant-design/icons";
import { Auth } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import {
  DirectMessagesProvider,
  useDMs,
  useNotificationsBadges,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAvatarByUID } from "utils/utils";
import ChatMain from "../../components/ChatV2/ChatMain";
import { GrayPageHeader } from "../../components/PageHeaders";

function DMMain() {
  const navigate = useNavigate();
  const { removeDMBadge } = useNotificationsBadges();
  const { selectedChat } = useDMs();

  useEffect(() => {
    return () => {
      if (selectedChat.id) removeDMBadge(selectedChat.id);
    };
  }, [selectedChat]);

  return (
    <DirectMessagesProvider
      chatId={selectedChat.id}
      members={Object.keys(selectedChat.members)}
    >
      <GrayPageHeader
        backIcon={false}
        avatar={{
          icon: <UserOutlined />,
          src: getAvatarByUID(selectedChat.recipient.id),
          onClick: () => navigate("details"),
          style: { cursor: "pointer" },
        }}
        title={
          selectedChat.recipient
            ? selectedChat.recipient.name
            : "Removed Employee"
        }
      />
      <ChatMain type="chats" chatId={selectedChat.id} canUse />
    </DirectMessagesProvider>
  );
}

export default DMMain;
