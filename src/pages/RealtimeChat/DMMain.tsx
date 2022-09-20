import { UserOutlined } from "@ant-design/icons";
import { Auth } from "@cuttinboard/cuttinboard-library/firebase";
import {
  ChatRTDBProvider,
  useDMs,
  useEmployeesList,
  useNotificationsBadges,
} from "@cuttinboard/cuttinboard-library/services";
import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatMain from "../../components/ChatV2/ChatMain";
import { GrayPageHeader } from "../../components/PageHeaders";
import { QuickUserDialogAvatar } from "../../components/QuickUserDialog";

function DMMain() {
  const navigate = useNavigate();
  const { removeDMBadge } = useNotificationsBadges();
  const { selectedChat } = useDMs();
  const { getUniqAllEmployees, getEmployees, getOrgEmployees } =
    useEmployeesList();

  useEffect(() => {
    return () => {
      if (selectedChat.id) removeDMBadge(selectedChat.id);
    };
  }, [selectedChat]);

  const recipient = useMemo(() => {
    const { members } = selectedChat;
    const other = Object.keys(members).find(
      (id) => id !== Auth.currentUser.uid
    );
    return getUniqAllEmployees().find(({ id }) => id === other);
  }, [selectedChat.id, selectedChat, getEmployees, getOrgEmployees]);

  return (
    <ChatRTDBProvider
      chatType="chats"
      chatId={selectedChat.id}
      members={Object.keys(selectedChat.members)}
    >
      <GrayPageHeader
        backIcon={false}
        avatar={{
          icon: <UserOutlined />,
          src: <QuickUserDialogAvatar employee={recipient} />,
        }}
        onBack={() => navigate("details")}
        title={
          recipient
            ? `${recipient.name} ${recipient.lastName}`
            : "Removed Employee"
        }
      />
      <ChatMain type="chats" chatId={selectedChat.id} canUse />
    </ChatRTDBProvider>
  );
}

export default DMMain;
