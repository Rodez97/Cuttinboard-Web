/** @jsx jsx */
import { jsx } from "@emotion/react";
import { BaseMediaProps } from "./BaseMediaProps";
import { Image, Spin } from "antd/es";
import imgPlaceholderResultImg from "../../../assets/images/placeholder_result_img.png";
import { memo } from "react";

function ImageMessage(props: BaseMediaProps) {
  if (props.src === imgPlaceholderResultImg) {
    return (
      <div
        css={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 200,
          width: 300,
        }}
      >
        <Spin />
      </div>
    );
  }

  return (
    <Image
      height={200}
      loading="lazy"
      css={{
        margin: 0,
        padding: 0,
        objectFit: "contain",
        cursor: "pointer",
      }}
      placeholder={
        <div
          css={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 200,
            width: 300,
          }}
        >
          <Spin />
        </div>
      }
      fallback={imgPlaceholderResultImg}
      {...props}
    />
  );
}

export default memo(ImageMessage);
