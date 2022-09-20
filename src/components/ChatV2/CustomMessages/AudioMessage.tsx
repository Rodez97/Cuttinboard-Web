/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useEffect, useRef, useState } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/src/styles.scss";
import { BaseMediaProps } from "components/ChatV2/CustomMessages/BaseMediaProps";
import FileMessage from "components/ChatV2/CustomMessages/FileMessage";
import Linkify from "linkify-react";
import { Space, Typography } from "antd";

function AudioMessage({ source, message, ...otherProps }: BaseMediaProps) {
  const audio = useRef<AudioPlayer>(null);
  const [supportsFormat, setSupportsFormat] = useState(null);

  useEffect(() => {
    const canPlay = canPlayAudio();
    setSupportsFormat(canPlay);
  }, []);

  const canPlayAudio = () => {
    if (!otherProps?.attachment?.mimeType) {
      return false;
    }
    const aud = document.createElement("audio");
    const isSupp = aud.canPlayType(otherProps.attachment.mimeType);
    aud.remove();
    return isSupp === "probably" || isSupp === "maybe";
  };

  if (supportsFormat === false) {
    return <FileMessage source={source} {...otherProps} />;
  }

  return (
    <Space direction="vertical">
      <div css={{ width: 300 }}>
        <AudioPlayer
          ref={audio}
          autoPlay={false}
          autoPlayAfterSrcChange={false}
          customAdditionalControls={[]}
          src={source}
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
            {message}
          </Linkify>
        </Typography.Paragraph>
      )}
    </Space>
  );
}

export default AudioMessage;
