import React, { useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import ConversationsMain from "./ConversationsMain";
import { useConversations } from "@cuttinboard-solutions/cuttinboard-library/services";
import { NotFound } from "../../components/NotFound";

function ConversationsRoutes() {
  const { boardId } = useParams();
  const { selectedConversation, setConversationId } = useConversations();

  useLayoutEffect(() => {
    setConversationId(boardId);
    return () => {
      setConversationId(null);
    };
  }, [boardId]);

  if (!selectedConversation) {
    return <NotFound />;
  }

  return <ConversationsMain />;
}

export default ConversationsRoutes;
