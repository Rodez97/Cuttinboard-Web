/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Typography } from "antd";
import CuttinboardAvatar from "../../shared/atoms/Avatar";

export function GroupHeadingAvatar({
  avatar,
  name,
}: {
  avatar?: string;
  name: string;
}) {
  return (
    <div
      css={{
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <CuttinboardAvatar alt={name} size={30} src={avatar} />
      <Typography>{name}</Typography>
    </div>
  );
}
