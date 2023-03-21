/** @jsx jsx */
import { jsx } from "@emotion/react";
import { memo } from "react";
import ChatMain from "../components/ChatMain";
import { Layout } from "antd";
import { MessagesProvider } from "@cuttinboard-solutions/cuttinboard-library";
import { GrayPageHeader, LoadingPage } from "../../shared";
import { useNavigate } from "react-router-dom";
import { IConversation } from "@cuttinboard-solutions/types-helpers";

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
        LoadingRenderer={<LoadingPage />}
        messagingType={{
          type: "conversation",
          chatId: activeConversation.id,
        }}
        batchSize={20}
        initialLoadSize={50}
      >
        <GrayPageHeader
          onBack={() => navigate("../")}
          title={activeConversation.name}
          subTitle={activeConversation.locationName}
        />
        <ChatMain type="conversations" canUse={false} />
      </MessagesProvider>
    </Layout.Content>
  );
}

export default memo(ConversationsMain);
