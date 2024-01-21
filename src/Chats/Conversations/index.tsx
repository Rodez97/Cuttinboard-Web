/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Layout } from "antd/es";
import ConversationsList from "./ConversationsList";
import { useTranslation } from "react-i18next";
import convImage from "../../assets/images/chat.png";
import {
  ConversationsProvider,
  useConversations,
} from "@rodez97/cuttinboard-library";
import { EmptyBoard, NotFound } from "../../shared";
import usePageTitle from "../../hooks/usePageTitle";
import ConversationsMain from "./ConversationsMain";
import { Route, Routes, useParams } from "react-router-dom";
import { useEffect } from "react";
import EmptyExtended from "../../shared/molecules/EmptyExtended";
import { useDrawerSider } from "../../shared/organisms/useDrawerSider";

export default () => {
  usePageTitle("My Message Boards");
  const { t } = useTranslation();
  const { DrawerSider, DrawerHeaderControl } = useDrawerSider();

  return (
    <ConversationsProvider>
      <DrawerHeaderControl title={t("My Message Boards")} />
      <Layout hasSider>
        <DrawerSider>
          <ConversationsList />
        </DrawerSider>
        {/* <Layout.Sider
          width={250}
          breakpoint="lg"
          collapsedWidth="0"
          className="module-sider"
        >
          <ConversationsList />
        </Layout.Sider> */}
        <Layout.Content css={{ display: "flex", flexDirection: "column" }}>
          <Routes>
            <Route path=":conversationId" element={<Main />} />
            <Route
              index
              element={
                <EmptyExtended
                  description={
                    <p>
                      {t("Welcome to My Message Boards")}
                      {". "}
                      <a
                        href="http://www.cuttinboard.com/help/message-boards"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t("Learn more")}
                      </a>
                    </p>
                  }
                  image={convImage}
                  descriptions={[
                    "Communicate with your team",
                    "Participate in the Message Boards you are a member of",
                    "See all the Message Boards you belong to across multiple locations",
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
  const { activeConversation, selectConversationId } = useConversations();

  useEffect(() => {
    if (conversationId) {
      selectConversationId(conversationId);
    }

    return () => {
      selectConversationId("");
    };
  }, [conversationId, selectConversationId]);

  if (!activeConversation) {
    return (
      <EmptyBoard
        description={
          <p>
            {t("Welcome to My Message Boards")}
            {". "}
            <a
              href="http://www.cuttinboard.com/help/message-boards"
              target="_blank"
              rel="noreferrer"
            >
              {t("Learn more")}
            </a>
          </p>
        }
        image={convImage}
      />
    );
  }

  return <ConversationsMain activeConversation={activeConversation} canUse />;
};
