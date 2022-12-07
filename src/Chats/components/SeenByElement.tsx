/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useMemo } from "react";
import mdiCheckAll from "@mdi/svg/svg/check-all.svg";
import Icon from "@ant-design/icons";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import {
  Message,
  useDirectMessageChat,
} from "@cuttinboard-solutions/cuttinboard-library/chats";

function SeenByElement({ message }: { message: Message }) {
  const { selectedDirectMessageChat } = useDirectMessageChat();
  const getAllSeen = useMemo(() => {
    if (!selectedDirectMessageChat) {
      return false;
    }
    return selectedDirectMessageChat.membersList.every(
      (member) => message.seenBy?.[member] === true
    );
  }, [selectedDirectMessageChat, message]);

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
