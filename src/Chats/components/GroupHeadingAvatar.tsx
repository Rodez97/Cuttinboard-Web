/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Typography } from "antd/es";
import CuttinboardAvatar from "../../shared/atoms/Avatar";
import {
  getConversationMember,
  useConversations,
  useCuttinboard,
  useDirectMessageChat,
} from "@rodez97/cuttinboard-library";
import { IMessage } from "@rodez97/types-helpers";
import { useTranslation } from "react-i18next";

export function GroupHeadingAvatarMB({ message }: { message: IMessage }) {
  const { t } = useTranslation();
  const { activeConversation } = useConversations();

  const sender = activeConversation
    ? getConversationMember(message.user._id, activeConversation)
    : null;

  return (
    <GroupHeadingAvatarComponent
      name={sender?.name ?? t("Deleted User")}
      avatar={sender?.avatar ?? ""}
    />
  );
}

export function GroupHeadingAvatarDM({ message }: { message: IMessage }) {
  const { t } = useTranslation();
  const { user } = useCuttinboard();
  const { recipientUser } = useDirectMessageChat();

  const sender =
    message.user._id === user.uid
      ? {
          name: user.displayName,
          avatar: user.photoURL,
        }
      : {
          name: recipientUser?.name,
          avatar: recipientUser?.avatar,
        };

  return (
    <GroupHeadingAvatarComponent
      name={sender?.name ?? t("Deleted User")}
      avatar={sender?.avatar ?? ""}
    />
  );
}

function GroupHeadingAvatarComponent({
  avatar,
  name,
}: {
  avatar?: string;
  name: string;
}) {
  return (
    <div
      css={{
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <CuttinboardAvatar alt={name} size={30} src={avatar} />
      <Typography>{name}</Typography>
    </div>
  );
}
