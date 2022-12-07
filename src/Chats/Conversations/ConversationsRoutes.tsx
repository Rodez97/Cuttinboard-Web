import React, { useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import ConversationsMain from "./ConversationsMain";
import { NotFound } from "../../components/NotFound";
import { useConversations } from "@cuttinboard-solutions/cuttinboard-library/chats";

function ConversationsRoutes() {
  const { boardId } = useParams();
  const { activeConversation, setActiveConversationId } = useConversations();

  useLayoutEffect(() => {
    if (boardId) {
      setActiveConversationId(boardId);
    }
    return () => {
      setActiveConversationId("");
    };
  }, [boardId, setActiveConversationId]);

  if (!activeConversation) {
    return <NotFound />;
  }

  return <ConversationsMain />;
}

export default ConversationsRoutes;
