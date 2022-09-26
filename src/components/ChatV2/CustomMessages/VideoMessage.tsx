/** @jsx jsx */
import { Message } from "@cuttinboard-solutions/cuttinboard-library/models";
import { jsx } from "@emotion/react";
import { Space, Typography } from "antd";
import Linkify from "linkify-react";
import ReactPlayer from "react-player";

function VideoMessage({
  message,
}: {
  message?: Message & { type: "attachment" | "mediaUri" | "youtube" };
}) {
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
    <Space direction="vertical">
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
      {message && message.message !== "🎞️ Video Message" && (
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

export default VideoMessage;
