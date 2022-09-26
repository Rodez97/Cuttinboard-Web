/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useRef, useState } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/src/styles.scss";
import { BaseMediaProps } from "components/ChatV2/CustomMessages/BaseMediaProps";
import FileMessage from "components/ChatV2/CustomMessages/FileMessage";
import Linkify from "linkify-react";
import { Space, Typography } from "antd";

function AudioMessage({ message }: BaseMediaProps) {
  const audio = useRef<AudioPlayer>(null);
  const [supportsFormat] = useState(() => canPlayAudio());

  const canPlayAudio = () => {
    if (message.type !== "attachment") {
      return false;
    }
    const aud = document.createElement("audio");
    const isSupp = aud.canPlayType(message.attachment.mimeType);
    aud.remove();
    return isSupp === "probably" || isSupp === "maybe";
  };

  if (supportsFormat === false) {
    return <FileMessage message={message} />;
  }

  const getSrc = () => {
    if (message.type === "mediaUri") {
      return message.sourceUrl;
    } else {
      return message.attachment.uri;
    }
  };

  return (
    <Space direction="vertical">
      <div css={{ width: 300 }}>
        <AudioPlayer
          ref={audio}
          autoPlay={false}
          autoPlayAfterSrcChange={false}
          customAdditionalControls={[]}
          src={getSrc()}
          // other props here
          css={{
            borderRadius: 5,
          }}
        />
      </div>
      {message && (
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
            {message.message}
          </Linkify>
        </Typography.Paragraph>
      )}
    </Space>
  );
}

export default AudioMessage;
