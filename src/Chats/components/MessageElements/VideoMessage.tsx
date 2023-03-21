/** @jsx jsx */
import { jsx } from "@emotion/react";
import ReactPlayer from "react-player";
import { BaseMediaProps } from "./BaseMediaProps";

function VideoMessage({ src }: BaseMediaProps) {
  const handleOpen = () => {
    window.open(src, "_blanc");
  };

  return (
    <ReactPlayer
      url={src}
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
