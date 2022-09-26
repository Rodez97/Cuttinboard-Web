/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Message } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Typography } from "antd";
import AudioMessage from "components/ChatV2/CustomMessages/AudioMessage";
import FileMessage from "components/ChatV2/CustomMessages/FileMessage";
import ImageMessage from "components/ChatV2/CustomMessages/ImageMessage";
import VideoMessage from "components/ChatV2/CustomMessages/VideoMessage";
import Linkify from "linkify-react";

interface MessageElementProps {
  targetMsg: Message & { type: "attachment" | "youtube" | "mediaUri" | "text" };
}

function MessageElement({ targetMsg }: MessageElementProps) {
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

  return (
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
  );
}

export default MessageElement;
