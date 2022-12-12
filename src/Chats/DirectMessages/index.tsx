/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Layout } from "antd";
import ErrorPage from "../../shared/molecules/PageError";
import LoadingPage from "../../shared/molecules/LoadingPage";
import DMList from "./DMList";
import DMRoutes from "./DMRoutes";
import { Route, Routes } from "react-router-dom";
import dmImage from "../../assets/images/encrypted-data.png";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";
import { DirectMessageChatProvider } from "@cuttinboard-solutions/cuttinboard-library/chats";
import { EmptyBoard, NotFound } from "../../shared";

export default () => {
  const { t } = useTranslation();

  return (
    <DirectMessageChatProvider onError={recordError}>
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
              <DMList />
            </Layout.Sider>
            <Layout.Content css={{ display: "flex", flexDirection: "column" }}>
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
