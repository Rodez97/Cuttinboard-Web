/** @jsx jsx */
import { jsx } from "@emotion/react";
import { recordError } from "../../utils/utils";
import mdiHeartMinus from "@mdi/svg/svg/heart-minus.svg";
import mdiHeartPlus from "@mdi/svg/svg/heart-plus.svg";
import Icon from "@ant-design/icons";
import { Button, Dropdown } from "antd";
import styled from "@emotion/styled";
import { Message } from "@cuttinboard-solutions/cuttinboard-library/models";
import { useCallback } from "react";

const EmojiButton = styled.p`
  transition: transform 0.2s; /* Animation */
  cursor: pointer;
  font-size: 20px;
  :hover {
    transform: scale(1.5);
  }
`;

const emojis = ["👍", "👎", "😄", "🎉", "😕", "❤️"];

function MessageReactionPicker({ message }: { message: Message }) {
  const addReactionToMessage = useCallback(
    (emoji?: string) => async () => {
      try {
        await message.addReaction(emoji);
      } catch (error) {
        recordError(error);
      }
    },
    [message]
  );

  const removeReactionFromMessage = useCallback(async () => {
    try {
      await message.addReaction();
    } catch (error) {
      recordError(error);
    }
  }, [message]);

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
      open={message.haveUserReaction ? false : undefined}
    >
      <Button
        onClick={message.haveUserReaction && removeReactionFromMessage}
        icon={
          message.haveUserReaction ? (
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
