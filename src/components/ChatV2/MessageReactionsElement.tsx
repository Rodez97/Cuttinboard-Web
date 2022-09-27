/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Message } from "@cuttinboard-solutions/cuttinboard-library/models";
import { groupBy } from "lodash";
import { useMemo } from "react";
import { Tag, Tooltip } from "antd";

function MessageReactionsElement({
  reactions,
}: {
  reactions?: (Message & {
    type: "attachment" | "youtube" | "mediaUri" | "text";
  })["reactions"];
}) {
  const getReactions = useMemo(() => {
    if (!reactions) {
      return [];
    }
    const emojisColl = Object.entries(reactions).map(([id, data]) => {
      const { emoji, name } = data;
      return { emoji, id, name };
    });
    return Object.entries(groupBy(emojisColl, "emoji"));
  }, [reactions]);

  if (!Boolean(getReactions.length)) {
    return null;
  }

  return (
    <div css={{ display: "flex", flexDirection: "row", gap: 5 }}>
      {getReactions.map(([emoji, reactionObject]) => {
        const count = reactionObject.length;
        const names = reactionObject.reduce(
          (acc, val, i) => `${acc} ${val.name};`,
          ""
        );
        return (
          <Tooltip title={names}>
            <Tag>{`${emoji} ${count}`}</Tag>
          </Tooltip>
        );
      })}
    </div>
  );
}

export default MessageReactionsElement;
