/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Layout } from "antd";
import ConversationsList from "./ConversationsList";
import { useTranslation } from "react-i18next";
import convImage from "../../assets/images/chat.png";
import {
  ConversationsProvider,
  useConversations,
} from "@cuttinboard-solutions/cuttinboard-library";
import { EmptyBoard, NotFound } from "../../shared";
import usePageTitle from "../../hooks/usePageTitle";
import ConversationsMain from "./ConversationsMain";
import { Route, Routes, useParams } from "react-router-dom";
import { useEffect } from "react";
import EmptyExtended from "../../shared/molecules/EmptyExtended";

export default () => {
  usePageTitle("Conversations");
  const { t } = useTranslation();

  return (
    <ConversationsProvider>
      <Layout hasSider>
        <Layout.Sider
          width={250}
          breakpoint="lg"
          collapsedWidth="0"
          className="module-sider"
        >
          <ConversationsList />
        </Layout.Sider>
        <Layout.Content css={{ display: "flex", flexDirection: "column" }}>
          <Routes>
            <Route path=":conversationId" element={<Main />} />
            <Route
              index
              element={
                <EmptyExtended
                  description={
                    <p>
                      {t("Welcome to Conversations.")} <a>{t("Learn More")}</a>
                    </p>
                  }
                  image={convImage}
                  descriptions={[
                    "Communicate with your team",
                    "Participate in the conversations you are a member of",
                    "See all the conversations you belong to across multiple locations",
                  ]}
                />
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout.Content>
      </Layout>
    </ConversationsProvider>
  );
};

const Main = () => {
  const { t } = useTranslation();
  const { conversationId } = useParams();
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
        description={
          <p>
            {t("Welcome to Conversations.")} <a>{t("Learn More")}</a>
          </p>
        }
        image={convImage}
      />
    );
  }

  return <ConversationsMain activeConversation={activeConversation} canUse />;
};
