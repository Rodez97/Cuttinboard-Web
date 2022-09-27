/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  useConversationMessages,
  useDirectMessages,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { recordError } from "../../utils/utils";
import mdiHeartMinus from "@mdi/svg/svg/heart-minus.svg";
import mdiHeartPlus from "@mdi/svg/svg/heart-plus.svg";
import Icon from "@ant-design/icons";
import { Button, Dropdown } from "antd";
import styled from "@emotion/styled";

const EmojiButton = styled.p`
  transition: transform 0.2s; /* Animation */
  cursor: pointer;
  font-size: 20px;
  :hover {
    transform: scale(1.5);
  }
`;

const emojis = ["👍", "👎", "😄", "🎉", "😕", "❤️"];

function MessageReactionPicker({
  messageId,
  haveUserReaction,
  isChat,
}: {
  messageId: string;
  haveUserReaction?: boolean;
  isChat: boolean;
}) {
  const { addReaction } = isChat
    ? useDirectMessages()
    : useConversationMessages();

  const addReactionToMessage = (emoji?: string) => async () => {
    try {
      await addReaction(messageId, emoji);
    } catch (error) {
      recordError(error);
    }
  };

  const removeReactionFromMessage = async () => {
    try {
      await addReaction(messageId);
    } catch (error) {
      recordError(error);
    }
  };
  return (
    <Dropdown
      overlay={
        <div css={{ display: "flex", flexDirection: "row" }}>
          {emojis.map((emoji, i) => (
            <EmojiButton key={i} onClick={addReactionToMessage(emoji)}>
              {emoji}
            </EmojiButton>
          ))}
        </div>
      }
      placement="topLeft"
      open={haveUserReaction ? false : undefined}
    >
      <Button
        onClick={haveUserReaction && removeReactionFromMessage}
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
