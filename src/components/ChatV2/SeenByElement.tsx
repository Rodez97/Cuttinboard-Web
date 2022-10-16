/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useMemo } from "react";
import mdiCheckAll from "@mdi/svg/svg/check-all.svg";
import { Message } from "@cuttinboard-solutions/cuttinboard-library/models";
import Icon from "@ant-design/icons";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { useDMs } from "@cuttinboard-solutions/cuttinboard-library/services";

function SeenByElement({ message }: { message: Message }) {
  const { selectedChat } = useDMs();
  const getAllSeen = useMemo(() => {
    if (!selectedChat) {
      return false;
    }
    return selectedChat.membersList.every(
      (member) => message.seenBy[member] === true
    );
  }, [selectedChat, message]);

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
