/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Space, Typography } from "antd";
import { BaseMediaProps } from "components/ChatV2/CustomMessages/BaseMediaProps";
import Linkify from "linkify-react";
import React from "react";
import ReactPlayer from "react-player";

function VideoMessage({ source, message }: BaseMediaProps) {
  const handleOpen = () => {
    window.open(source, "_blanc");
  };

  return (
    <Space direction="vertical">
      <ReactPlayer
        url={source}
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
      {message && message !== "🎞️ Video Message" && (
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

export default VideoMessage;
