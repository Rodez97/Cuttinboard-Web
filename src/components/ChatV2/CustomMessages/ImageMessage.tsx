/** @jsx jsx */
import { jsx } from "@emotion/react";
import Linkify from "linkify-react";
import { BaseMediaProps } from "./BaseMediaProps";
import Img from "react-cool-img";
import { Space, Typography } from "antd";
import PlaceholderImg from "../../../assets/images/placeholder_result_img.png";

function ImageMessage({ message }: BaseMediaProps) {
  const getSrc = () => {
    if (message.type === "mediaUri") {
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
      <Img
        alt="Message Media"
        placeholder={PlaceholderImg}
        src={getSrc()}
        error={PlaceholderImg}
        width="100%"
        css={{
          margin: 0,
          padding: 0,
          objectFit: "contain",
          cursor: "pointer",
          maxWidth: 400,
          minWidth: 120,
        }}
        onClick={handleOpen}
      />
      {message.message && message.message !== "🖼️ Image Message" && (
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

export default ImageMessage;
