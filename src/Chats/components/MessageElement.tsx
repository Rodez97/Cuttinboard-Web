/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Space, Typography } from "antd";
import AudioMessage from "./MessageElements/AudioMessage";
import FileMessage from "./MessageElements/FileMessage";
import ImageMessage from "./MessageElements/ImageMessage";
import VideoMessage from "./MessageElements/VideoMessage";
import Linkify from "linkify-react";
import {
  Message,
  ReplyRecipient,
} from "@cuttinboard-solutions/cuttinboard-library/chats";

interface MessageElementProps {
  targetMsg: Message | ReplyRecipient;
}

const defaultMessages = [
  "🖼️ Image Message",
  "🎞️ Video Message",
  "📁 File Message",
];

function MessageElement({ targetMsg }: MessageElementProps) {
  const AuxElement = () => {
    if (targetMsg.type === "attachment" || targetMsg.type === "mediaUri") {
      const { contentType } = targetMsg;
      switch (contentType) {
        case "image":
          return <ImageMessage message={targetMsg} />;
        case "video":
          return <VideoMessage message={targetMsg} />;
        case "audio":
          return <AudioMessage message={targetMsg} />;
        case "file":
          return <FileMessage message={targetMsg} />;

        default:
          return null;
      }
    }

    if (targetMsg.type === "youtube") {
      return <VideoMessage message={targetMsg} />;
    }
    return null;
  };

  return (
    <Space direction="vertical">
      <AuxElement />
      {targetMsg.message && !defaultMessages.includes(targetMsg.message) && (
        <Typography.Paragraph
          css={{
            color: "inherit",
            whiteSpace: "pre-line",
            wordBreak: "break-word",
            fontSize: 14,
            marginBottom: "0px !important",
          }}
        >
          <Linkify
            options={{
              target: "_blank",
              rel: "noreferrer noopener",
              className: "linkifyInnerStyle",
            }}
          >
            {targetMsg.message}
          </Linkify>
        </Typography.Paragraph>
      )}
    </Space>
  );
}

export default MessageElement;
