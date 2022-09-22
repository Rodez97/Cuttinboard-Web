/** @jsx jsx */
import { jsx } from "@emotion/react";
import { GithubSelector } from "@charkour/react-reactions";
import { useChatRTDB } from "@cuttinboard-solutions/cuttinboard-library/services";
import React, { useState } from "react";
import { recordError } from "../../utils/utils";
import mdiHeartMinus from "@mdi/svg/svg/heart-minus.svg";
import mdiHeartPlus from "@mdi/svg/svg/heart-plus.svg";
import Icon from "@ant-design/icons";
import { Button, Dropdown, Modal } from "antd";

function MessageReactionPicker({
  messageId,
  haveUserReaction,
}: {
  messageId: string;
  haveUserReaction?: boolean;
}) {
  const { addReaction } = useChatRTDB();

  const addReactionToMessage = async (emoji?: string) => {
    try {
      await addReaction(messageId, emoji);
    } catch (error) {
      recordError(error);
    }
  };
  return (
    <Dropdown
      overlay={<GithubSelector onSelect={addReactionToMessage} />}
      destroyPopupOnHide
    >
      <Button
        icon={
          haveUserReaction ? (
            <Icon component={mdiHeartMinus} css={{ color: "#ff5f02" }} />
          ) : (
            <Icon component={mdiHeartPlus} css={{ color: "#cecece" }} />
          )
        }
      />
    </Dropdown>
  );
}

export default MessageReactionPicker;
