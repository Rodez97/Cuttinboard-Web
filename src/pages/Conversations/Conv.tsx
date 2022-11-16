/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Navigate, Route, Routes } from "react-router-dom";
import PageError from "../../components/PageError";
import { Layout } from "antd";
import { ConversationsProvider } from "@cuttinboard-solutions/cuttinboard-library/services";
import PageLoading from "../../components/PageLoading";
import ConversationsRoutes from "./ConversationsRoutes";
import ConversationsList from "./ConversationsList";
import { useTranslation } from "react-i18next";
import convImage from "../../assets/images/chat.png";
import { recordError } from "../../utils/utils";
import { EmptyMainModule } from "../../components";

const Conv = () => {
  const { t } = useTranslation();

  return (
    <ConversationsProvider onError={recordError}>
      {({ loading, error }) =>
        loading ? (
          <PageLoading />
        ) : error ? (
          <PageError error={error} />
        ) : (
          <Layout hasSider>
            <Layout.Sider width={250} breakpoint="lg" collapsedWidth="0">
              <ConversationsList />
            </Layout.Sider>
            <Layout.Content>
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

export default Conv;
