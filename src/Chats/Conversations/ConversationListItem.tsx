import { MessageOutlined } from "@ant-design/icons";
import { useNotifications } from "@rodez97/cuttinboard-library";
import { IConversation } from "@rodez97/types-helpers";
import { Badge } from "antd/es";
import React, { useMemo } from "react";

interface ConversationListItemProps {
  conversation: IConversation;
  selected: boolean;
  onSelect: (conversation: IConversation) => void;
}

export default function ConversationListItem({
  conversation,
  selected,
  onSelect,
}: ConversationListItemProps) {
  const { getBadgesByConversation } = useNotifications();
  const badges = useMemo(
    () => getBadgesByConversation(conversation.id),
    [conversation.id, getBadgesByConversation]
  );

  return (
    <div
      key={conversation.id}
      className="dm-list-item"
      onClick={() => onSelect(conversation)}
      style={
        selected
          ? {
              backgroundColor: "#f1f1f0",
            }
          : {}
      }
    >
      <div className="dm-list-item__container">
        <div className="dm-list-item__title">
          {badges > 0 ? (
            <Badge count={badges} size="small" className="dm-list-item__icon" />
          ) : (
            <MessageOutlined className="dm-list-item__icon" />
          )}

          <p className="dm-list-item__text">{conversation.name}</p>
        </div>

        <p className="dm-list-item__subtext">{conversation.locationName}</p>
      </div>
    </div>
  );
}
