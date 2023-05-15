/** @jsx jsx */
import { jsx } from "@emotion/react";
import { UserOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import ChatMain from "../components/ChatMain";
import DMDetails from "./DMDetails";
import {
  MessagesProvider,
  useDisclose,
  useNotifications,
} from "@cuttinboard-solutions/cuttinboard-library";
import { GrayPageHeader } from "../../shared";
import { IDirectMessage, Sender } from "@cuttinboard-solutions/types-helpers";
import { Alert } from "antd";
import { useTranslation } from "react-i18next";
import { BATCH_SIZE, INITIAL_LOAD_SIZE } from "../ChatConstants";

export default ({
  recipientUser,
  selectedDirectMessage,
}: {
  recipientUser: Sender;
  selectedDirectMessage: IDirectMessage;
}) => {
  const { t } = useTranslation();
  const { removeDMBadge } = useNotifications();
  const [infoOpen, openInfo, closeInfo] = useDisclose();

  useEffect(() => {
    removeDMBadge(selectedDirectMessage.id);

    return () => {
      removeDMBadge(selectedDirectMessage.id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDirectMessage.id]);

  return (
    <MessagesProvider
      messagingType={{
        type: "dm",
        chatId: selectedDirectMessage.id,
      }}
      batchSize={BATCH_SIZE}
      initialLoadSize={INITIAL_LOAD_SIZE}
    >
      <GrayPageHeader
        backIcon={false}
        avatar={
          recipientUser._id === "deleted"
            ? { icon: <UserOutlined /> }
            : {
                src: recipientUser.avatar,
                onClick: openInfo,
                style: { cursor: "pointer" },
                icon: <UserOutlined />,
              }
        }
        title={recipientUser.name}
      />
      {recipientUser._id === "deleted" && (
        <Alert
          message={t("DM_DELETED_USER_WARNING")}
          banner
          css={{
            marginBottom: "1rem",
          }}
        />
      )}

      <ChatMain canUse={recipientUser._id !== "deleted"} />

      <DMDetails open={infoOpen} onCancel={closeInfo} />
    </MessagesProvider>
  );
};
