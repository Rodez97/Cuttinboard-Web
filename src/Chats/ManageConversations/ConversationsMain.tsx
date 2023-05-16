/** @jsx jsx */
import { jsx } from "@emotion/react";
import { memo } from "react";
import ChatMain from "../components/ChatMain";
import { Layout } from "antd";
import { MessagesProvider } from "@cuttinboard-solutions/cuttinboard-library";
import { GrayPageHeader } from "../../shared";
import { useNavigate } from "react-router-dom";
import { IConversation } from "@cuttinboard-solutions/types-helpers";
import { BATCH_SIZE, INITIAL_LOAD_SIZE } from "../ChatConstants";

function ConversationsMain({
  activeConversation,
}: {
  activeConversation: IConversation;
}) {
  const navigate = useNavigate();

  return (
    <Layout.Content
      css={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <MessagesProvider
        messagingType={{
          type: "conversation",
          chatId: activeConversation.id,
        }}
        batchSize={BATCH_SIZE}
        initialLoadSize={INITIAL_LOAD_SIZE}
      >
        <GrayPageHeader
          onBack={() => navigate("../")}
          title={activeConversation.name}
          subTitle={activeConversation.locationName}
        />
        <ChatMain canUse={false} type="mb" />
      </MessagesProvider>
    </Layout.Content>
  );
}

export default memo(ConversationsMain);
