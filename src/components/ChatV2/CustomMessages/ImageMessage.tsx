/** @jsx jsx */
import { jsx } from "@emotion/react";
import Linkify from "linkify-react";
import { useCallback, useState } from "react";
import { BaseMediaProps } from "./BaseMediaProps";
import Img from "react-cool-img";
import { Space, Typography } from "antd";
import PlaceholderImg from "../../../assets/images/placeholder_result_img.png";

function ImageMessage({ source, message }: BaseMediaProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoaded = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleOpen = () => {
    window.open(source, "_blanc");
  };

  return (
    <Space direction="vertical">
      <Img
        alt="Message Media"
        placeholder={PlaceholderImg}
        src={source}
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
      {message && message !== "🖼️ Image Message" && (
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

export default ImageMessage;
