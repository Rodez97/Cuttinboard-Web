/** @jsx jsx */
import { jsx } from "@emotion/react";
import CuttinboardAvatar from "../../shared/atoms/Avatar";

export function GroupHeadingAvatar({
  showAvatar,
  avatar,
  userId,
}: {
  showAvatar?: boolean;
  avatar?: string;
  userId: string;
}) {
  return (
    <div
      css={{
        width: 40,
        alignSelf: "flex-start",
        justifyContent: "flex-end",
        display: "flex",
        marginTop: 2,
      }}
    >
      {showAvatar && (
        <CuttinboardAvatar size={40} src={avatar} userId={userId} />
      )}
    </div>
  );
}
