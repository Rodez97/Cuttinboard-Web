/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Layout } from "antd";
import ConversationsList from "./ConversationsList";
import { useTranslation } from "react-i18next";
import {
  ConversationsProvider,
  useConversations,
  useCuttinboardLocation,
} from "@cuttinboard-solutions/cuttinboard-library";
import { EmptyBoard } from "../../shared";
import usePageTitle from "../../hooks/usePageTitle";
import ConversationsMain from "./ConversationsMain";
import { Route, Routes, useParams } from "react-router-dom";
import { useEffect } from "react";

export default () => {
  usePageTitle("Conversations Settings");
  const { location } = useCuttinboardLocation();

  return (
    <ConversationsProvider locationId={location.id}>
      <Layout hasSider>
        <Layout.Content>
          <Routes>
            <Route path=":conversationId" element={<Main />} />
            <Route index element={<ConversationsList />} />
          </Routes>
        </Layout.Content>
      </Layout>
    </ConversationsProvider>
  );
};

const Main = () => {
  const { conversationId } = useParams();
  const { t } = useTranslation();
  const { activeConversation, selectConversation } = useConversations();

  useEffect(() => {
    if (conversationId) {
      selectConversation(conversationId);
    }

    return () => {
      selectConversation("");
    };
  }, [conversationId, selectConversation]);

  if (!activeConversation) {
    return (
      <EmptyBoard
        description={t(
          "The conversation you are looking for does not exist or has been deleted."
        )}
      />
    );
  }

  return <ConversationsMain activeConversation={activeConversation} />;
};
