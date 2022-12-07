/** @jsx jsx */

import {
  Message,
  ReplyRecipient,
} from "@cuttinboard-solutions/cuttinboard-library/chats";
import { jsx } from "@emotion/react";
import ReactPlayer from "react-player";

function VideoMessage({ message }: { message: Message | ReplyRecipient }) {
  const getSrc = () => {
    if (message.type === "mediaUri" || message.type === "youtube") {
      return message.sourceUrl;
    } else {
      return message.attachment.uri;
    }
  };

  const handleOpen = () => {
    window.open(getSrc(), "_blanc");
  };

  return (
    <ReactPlayer
      url={getSrc()}
      controls
      width="100%"
      height="auto"
      css={{
        objectFit: "contain",
        maxWidth: 400,
        minWidth: 120,
      }}
      onClick={handleOpen}
    />
  );
}

export default VideoMessage;
