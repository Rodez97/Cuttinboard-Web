/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Typography } from "antd";
import Linkify from "linkify-react";

function isEmojiOnly(text: string) {
  return /^[\uD800-\uDFFF]+$/.test(text);
}

function MessageElement({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <div css={{ width: "100%" }}>
      {message && isEmojiOnly(message) ? (
        <Typography.Paragraph
          css={{
            color: "inherit",
            whiteSpace: "pre-line",
            wordBreak: "break-word",
            fontSize: "2.5rem",
            marginBottom: "0px !important",
          }}
        >
          {message}
        </Typography.Paragraph>
      ) : (
        <Typography.Paragraph
          css={{
            color: "inherit",
            whiteSpace: "pre-line",
            wordBreak: "break-word",
            fontSize: "0.85rem",
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
    </div>
  );
}

export default MessageElement;
