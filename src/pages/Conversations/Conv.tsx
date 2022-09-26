/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import PageError from "../../components/PageError";
import { Layout } from "antd";
import { ConversationsProvider } from "@cuttinboard-solutions/cuttinboard-library/services";
import PageLoading from "../../components/PageLoading";
import ConversationsRoutes from "./ConversationsRoutes";
import ConversationsList from "./ConversationsList";
import { EmptyMainModule } from "../../Modules/Notes/EmptyMainModule";
import { useTranslation } from "react-i18next";
import convImage from "../../assets/images/chat.png";
import NewConversation from "./NewConversation";

const Conv = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const openNew = () => {
    navigate("new");
  };

  const openEdit = () => {
    navigate("edit");
  };

  return (
    <ConversationsProvider
      LoadingElement={<PageLoading />}
      ErrorElement={(error: Error) => <PageError error={error} />}
      openNew={openNew}
      openEdit={openEdit}
    >
      <Layout hasSider>
        <Layout.Sider width={250} breakpoint="lg" collapsedWidth="0">
          <ConversationsList />
        </Layout.Sider>
        <Layout.Content css={{ display: "flex", flexDirection: "column" }}>
          <Routes>
            <Route path="/">
              <Route
                index
                element={
                  <EmptyMainModule
                    description={
                      <p>
                        {t("Welcome to Conversations.")}{" "}
                        <a>{t("Learn More")}</a>
                      </p>
                    }
                    image={convImage}
                  />
                }
              />
              <Route path=":boardId/*" element={<ConversationsRoutes />} />
              <Route path="new" element={<NewConversation />} />
              <Route path="*" element={<Navigate to="/conversations" />} />
            </Route>
          </Routes>
        </Layout.Content>
      </Layout>
    </ConversationsProvider>
  );
};

export default Conv;
