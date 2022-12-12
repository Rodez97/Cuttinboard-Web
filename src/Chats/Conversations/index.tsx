/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Navigate, Route, Routes } from "react-router-dom";
import ErrorPage from "../../shared/molecules/PageError";
import { Layout } from "antd";
import LoadingPage from "../../shared/molecules/LoadingPage";
import ConversationsRoutes from "./ConversationsRoutes";
import ConversationsList from "./ConversationsList";
import { useTranslation } from "react-i18next";
import convImage from "../../assets/images/chat.png";
import { recordError } from "../../utils/utils";
import { ConversationsProvider } from "@cuttinboard-solutions/cuttinboard-library/chats";
import { EmptyBoard } from "../../shared";

export default () => {
  const { t } = useTranslation();

  return (
    <ConversationsProvider onError={recordError}>
      {({ loading, error }) =>
        loading ? (
          <LoadingPage />
        ) : error ? (
          <ErrorPage error={error} />
        ) : (
          <Layout hasSider>
            <Layout.Sider
              width={250}
              breakpoint="lg"
              collapsedWidth="0"
              className="module-sider"
            >
              <ConversationsList />
            </Layout.Sider>
            <Layout.Content>
              <Routes>
                <Route path="/">
                  <Route
                    index
                    element={
                      <EmptyBoard
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
                  <Route path=":boardId" element={<ConversationsRoutes />} />1{" "}
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
