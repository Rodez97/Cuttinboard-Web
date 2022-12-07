/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Layout } from "antd";
import PageError from "../../components/PageError";
import PageLoading from "../../components/PageLoading";
import DMList from "./DMList";
import DMRoutes from "./DMRoutes";
import { Route, Routes } from "react-router-dom";
import dmImage from "../../assets/images/encrypted-data.png";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";
import { EmptyMainModule } from "../../components";
import { NotFound } from "../../components/NotFound";
import { DirectMessageChatProvider } from "@cuttinboard-solutions/cuttinboard-library/chats";

export default () => {
  const { t } = useTranslation();

  return (
    <DirectMessageChatProvider onError={recordError}>
      {({ loading, error }) =>
        loading ? (
          <PageLoading />
        ) : error ? (
          <PageError error={error} />
        ) : (
          <Layout hasSider>
            <Layout.Sider
              width={250}
              breakpoint="lg"
              collapsedWidth="0"
              className="module-sider"
            >
              <DMList />
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
                        image={dmImage}
                      />
                    }
                  />
                  <Route path=":boardId" element={<DMRoutes />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Layout.Content>
          </Layout>
        )
      }
    </DirectMessageChatProvider>
  );
};
