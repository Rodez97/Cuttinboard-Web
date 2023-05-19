/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Typography } from "antd/es";
import CuttinboardAvatar from "../../shared/atoms/Avatar";
import {
  getConversationMember,
  useConversations,
  useCuttinboard,
  useDirectMessageChat,
} from "@cuttinboard-solutions/cuttinboard-library";
import { IMessage } from "@cuttinboard-solutions/types-helpers";

export function GroupHeadingAvatarMB({ message }: { message: IMessage }) {
  const { activeConversation } = useConversations();

  const sender = activeConversation
    ? getConversationMember(message.user._id, activeConversation)
    : null;

  return (
    <GroupHeadingAvatarComponent
      name={sender?.name ?? ""}
      avatar={sender?.avatar ?? ""}
    />
  );
}

export function GroupHeadingAvatarDM({ message }: { message: IMessage }) {
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
      name={sender?.name ?? ""}
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
