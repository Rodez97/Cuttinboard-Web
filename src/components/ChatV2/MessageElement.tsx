/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Message, MessageType } from "@cuttinboard/cuttinboard-library/models";
import { Typography } from "antd";
import AudioMessage from "components/ChatV2/CustomMessages/AudioMessage";
import FileMessage from "components/ChatV2/CustomMessages/FileMessage";
import ImageMessage from "components/ChatV2/CustomMessages/ImageMessage";
import VideoMessage from "components/ChatV2/CustomMessages/VideoMessage";
import Linkify from "linkify-react";
import React from "react";

interface MessageElementProps {
  targetMsg: Message & { type: MessageType };
  onReply: () => void;
  isReply?: boolean;
}

function MessageElement({ targetMsg, onReply, isReply }: MessageElementProps) {
  const { message, type, srcUrl, uploaded, attachment, id } = targetMsg;
  const handleReply = () => {
    if (!isReply) {
      onReply();
    }
  };
  switch (type) {
    case "image":
      return (
        <ImageMessage
          message={message}
          id={id}
          name={message}
          source={srcUrl}
          uploaded={uploaded}
          onReply={handleReply}
          attachment={attachment}
        />
      );
    case "video":
    case "yt":
      return (
        <VideoMessage
          message={message}
          id={id}
          name={message}
          source={srcUrl}
          uploaded={uploaded}
          onReply={handleReply}
          attachment={attachment}
        />
      );
    case "audio":
      return (
        <AudioMessage
          message={message}
          id={id}
          name={message}
          source={srcUrl}
          uploaded={uploaded}
          onReply={handleReply}
          attachment={attachment}
        />
      );
    case "file":
      return (
        <FileMessage
          message={message}
          id={id}
          source={srcUrl}
          uploaded={uploaded}
          name={message}
          onReply={handleReply}
          attachment={attachment}
        />
      );

    default:
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
            {message}
          </Linkify>
        </Typography.Paragraph>
      );
  }
}

export default MessageElement;
