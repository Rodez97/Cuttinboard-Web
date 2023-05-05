/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Typography } from "antd";
import CuttinboardAvatar from "../../shared/atoms/Avatar";

export function GroupHeadingAvatar({
  avatar,
  userId,
  name,
}: {
  avatar?: string;
  userId: string;
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
      <CuttinboardAvatar size={30} src={avatar} userId={userId} />
      <Typography>{name}</Typography>
    </div>
  );
}
