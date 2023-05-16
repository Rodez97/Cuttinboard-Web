/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useMemo } from "react";
import { Card } from "antd";
import MessageElement from "./MessageElement";
import {
  GroupHeadingAvatarDM,
  GroupHeadingAvatarMB,
} from "./GroupHeadingAvatar";
import AttachmentElement from "./AttachmentElement";
import { ImageMessage } from "./MessageElements";
import {
  IMessage,
  parseMediaFromText,
} from "@cuttinboard-solutions/types-helpers";
import MessageMenu from "./MessageMenu";

interface MessageBubbleProps {
  currentMessage: IMessage;
  canUse?: boolean;
  type: "dm" | "mb";
}

function MessageBubble({ currentMessage, canUse, type }: MessageBubbleProps) {
  const parsedMedia = useMemo(
    () =>
      currentMessage.text ? parseMediaFromText(currentMessage.text) : null,
    [currentMessage]
  );

  return (
    <Card
      title={
        type === "dm" ? (
          <GroupHeadingAvatarDM message={currentMessage} />
        ) : (
          <GroupHeadingAvatarMB message={currentMessage} />
        )
      }
      css={{
        minWidth: 350,
        maxWidth: 500,
        width: "100%",
        margin: "0 auto 10px auto",
      }}
      cover={
        currentMessage.image ? (
          <ImageMessage src={currentMessage.image} />
        ) : parsedMedia !== null ? (
          <AttachmentElement
            contentType={parsedMedia[0].type}
            sourceUrl={parsedMedia[0].url}
          />
        ) : null
      }
      extra={<MessageMenu currentMessage={currentMessage} canUse={canUse} />}
    >
      <MessageElement message={currentMessage.text} />
    </Card>
  );
}

export default MessageBubble;
