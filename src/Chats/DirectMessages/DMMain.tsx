/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useEffect } from "react";
import ChatMain from "../components/ChatMain";
import DMDetails from "./DMDetails";
import {
  MessagesProvider,
  useDisclose,
  useNotifications,
} from "@rodez97/cuttinboard-library";
import { GrayPageHeader } from "../../shared";
import { IDirectMessage, Sender } from "@rodez97/types-helpers";
import { Alert } from "antd/es";
import { useTranslation } from "react-i18next";
import { BATCH_SIZE, INITIAL_LOAD_SIZE } from "../ChatConstants";
import imgAvatar from "../../assets/images/avatar.webp";

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
  }, [removeDMBadge, selectedDirectMessage.id]);

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
            ? { src: imgAvatar }
            : {
                src: recipientUser.avatar ? recipientUser.avatar : imgAvatar,
                onClick: openInfo,
                style: { cursor: "pointer" },
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

      <ChatMain canUse={recipientUser._id !== "deleted"} type="dm" />

      <DMDetails open={infoOpen} onCancel={closeInfo} />
    </MessagesProvider>
  );
};
