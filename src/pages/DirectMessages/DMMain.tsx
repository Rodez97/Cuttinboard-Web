import { UserOutlined } from "@ant-design/icons";
import {
  CuttinboardUser,
  Employee,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import {
  DirectMessagesProvider,
  useDMs,
  useNotificationsBadges,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatMain from "../../ChatComponents/ChatMain";
import { GrayPageHeader } from "../../components/PageHeaders";
import { useDisclose } from "../../hooks";
import DMDetails from "./DMDetails";

function DMMain({ employee }: { employee: Employee | CuttinboardUser }) {
  const navigate = useNavigate();
  const { removeDMBadge } = useNotificationsBadges();
  const { selectedChat } = useDMs();
  const [infoOpen, openInfo, closeInfo] = useDisclose();

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
          src: selectedChat.recipient.avatar,
          onClick: openInfo,
          style: { cursor: "pointer" },
        }}
        title={
          selectedChat.recipient
            ? selectedChat.recipient.fullName
            : "Removed Employee"
        }
      />
      <ChatMain type="chats" chatId={selectedChat.id} canUse />

      <DMDetails open={infoOpen} onCancel={closeInfo} employee={employee} />
    </DirectMessagesProvider>
  );
}

export default DMMain;
