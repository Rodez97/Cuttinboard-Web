/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useMemo } from "react";
import mdiCheckAll from "@mdi/svg/svg/check-all.svg";
import { Message, MessageType } from "@cuttinboard/cuttinboard-library/models";
import Icon from "@ant-design/icons";
import { Colors } from "@cuttinboard/cuttinboard-library/utils";

function SeenByElement({
  message,
  members = [],
}: {
  message: Message & { type: MessageType };
  members: string[];
}) {
  const getAllSeen = useMemo(() => {
    return members.every((member) => message?.seenBy?.[member] === true);
  }, [members, message]);

  return (
    <Icon
      component={mdiCheckAll}
      css={{
        margin: "3px",
        color: getAllSeen ? Colors.MainBlue : "#888888",
        fontSize: 14,
        alignSelf: "flex-end",
      }}
    />
  );
}

export default SeenByElement;
