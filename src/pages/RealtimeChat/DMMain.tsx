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
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { removeDMBadge } = useNotificationsBadges();
  const { selectedChat } = useDMs();
  const { getUniqAllEmployees, getEmployees, getOrgEmployees } =
    useEmployeesList();

  useEffect(() => {
    return () => {
      if (boardId) removeDMBadge(boardId);
    };
  }, [boardId]);

  const recipient = useMemo(() => {
    const { members } = selectedChat;
    const other = Object.keys(members).find(
      (id) => id !== Auth.currentUser.uid
    );
    return getUniqAllEmployees().find(({ id }) => id === other);
  }, [boardId, selectedChat, getEmployees, getOrgEmployees]);

  return (
    <ChatRTDBProvider
      chatType="chats"
      chatId={boardId}
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
      <ChatMain type="chats" chatId={boardId} canUse />
    </ChatRTDBProvider>
  );
}

export default DMMain;
