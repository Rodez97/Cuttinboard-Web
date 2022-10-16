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
import ManageConversation from "./ManageConversation";
import { recordError } from "utils/utils";

const Conv = () => {
  const { t } = useTranslation();

  return (
    <ConversationsProvider onError={recordError}>
      {(loading, error) =>
        loading ? (
          <PageLoading />
        ) : error ? (
          <PageError error={error} />
        ) : (
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
                  <Route path="new" element={<ManageConversation />} />
                  <Route path="*" element={<Navigate to="/conversations" />} />
                </Route>
              </Routes>
            </Layout.Content>
          </Layout>
        )
      }
    </ConversationsProvider>
  );
};

export default Conv;
