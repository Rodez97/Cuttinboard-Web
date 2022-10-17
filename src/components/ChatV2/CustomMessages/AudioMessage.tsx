/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useRef, useState } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/src/styles.scss";
import { BaseMediaProps } from "./BaseMediaProps";
import FileMessage from "./FileMessage";

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
  );
}

export default AudioMessage;
