import { UserOutlined } from "@ant-design/icons";
import React, { useEffect } from "react";
import ChatMain from "../components/ChatMain";
import { GrayPageHeader } from "../../components/PageHeaders";
import DMDetails from "./DMDetails";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/employee";
import { CuttinboardUser } from "@cuttinboard-solutions/cuttinboard-library/account";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  MessagesProvider,
  useDirectMessageChat,
} from "@cuttinboard-solutions/cuttinboard-library/chats";
import { useDisclose } from "@cuttinboard-solutions/cuttinboard-library/utils";

export default ({
  employee,
}: {
  employee: Employee | CuttinboardUser | undefined;
}) => {
  const { notifications } = useCuttinboard();
  const { selectedDirectMessageChat } = useDirectMessageChat();
  const [infoOpen, openInfo, closeInfo] = useDisclose();

  useEffect(() => {
    if (selectedDirectMessageChat && notifications) {
      return () => {
        notifications.removeDMBadge(selectedDirectMessageChat.id);
      };
    }
  }, [notifications, selectedDirectMessageChat]);

  if (!selectedDirectMessageChat) {
    return null;
  }

  return (
    <MessagesProvider chatId={selectedDirectMessageChat.id} type="dm">
      <GrayPageHeader
        backIcon={false}
        avatar={{
          icon: <UserOutlined />,
          src: employee ? employee.avatar : undefined,
          onClick: openInfo,
          style: { cursor: "pointer" },
        }}
        title={
          selectedDirectMessageChat.recipient
            ? selectedDirectMessageChat.recipient.fullName
            : "Removed Employee"
        }
      />
      <ChatMain type="chats" chatId={selectedDirectMessageChat.id} canUse />

      <DMDetails open={infoOpen} onCancel={closeInfo} employee={employee} />
    </MessagesProvider>
  );
};
