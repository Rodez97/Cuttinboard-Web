import { UserOutlined } from "@ant-design/icons";
import React, { useEffect } from "react";
import ChatMain from "../components/ChatMain";
import DMDetails from "./DMDetails";
import {
  MessagesProvider,
  useCuttinboard,
  useDisclose,
  useNotifications,
} from "@cuttinboard-solutions/cuttinboard-library";
import { GrayPageHeader } from "../../shared";
import { PageLoading } from "@ant-design/pro-layout";
import {
  getDmRecipient,
  ICuttinboardUser,
  IDirectMessage,
  IEmployee,
} from "@cuttinboard-solutions/types-helpers";

export default ({
  employee,
  selectedDirectMessage,
}: {
  employee: IEmployee | ICuttinboardUser | undefined;
  selectedDirectMessage: IDirectMessage;
}) => {
  const { user } = useCuttinboard();
  const { removeDMBadge } = useNotifications();
  const [infoOpen, openInfo, closeInfo] = useDisclose();

  useEffect(() => {
    removeDMBadge(selectedDirectMessage.id);
  }, [removeDMBadge, selectedDirectMessage.id]);

  return (
    <MessagesProvider
      LoadingRenderer={<PageLoading />}
      messagingType={{
        type: "dm",
        chatId: selectedDirectMessage.id,
      }}
      batchSize={20}
      initialLoadSize={50}
    >
      <GrayPageHeader
        backIcon={false}
        avatar={{
          icon: <UserOutlined />,
          src:
            employee && employee.avatar
              ? employee.avatar
              : employee &&
                `https://api.dicebear.com/5.x/shapes/svg?seed=${employee.id}&background=%23ffffff&radius=50`,
          onClick: openInfo,
          style: { cursor: "pointer" },
        }}
        title={getDmRecipient(selectedDirectMessage, user.uid).name}
      />
      <ChatMain type="chats" canUse />

      <DMDetails open={infoOpen} onCancel={closeInfo} employee={employee} />
    </MessagesProvider>
  );
};
