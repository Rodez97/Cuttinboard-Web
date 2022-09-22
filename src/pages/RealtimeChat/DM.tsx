/** @jsx jsx */
import { jsx } from "@emotion/react";
import { DMsProvider } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Layout } from "antd";
import PageError from "../../components/PageError";
import PageLoading from "../../components/PageLoading";
import DMList from "./DMList";
import DMRoutes from "./DMRoutes";
import { Navigate, Route, Routes } from "react-router-dom";
import { EmptyMainModule } from "../../Modules/Notes/EmptyMainModule";
import dmImage from "../../assets/images/encrypted-data.png";
import { useTranslation } from "react-i18next";
import NewDM from "./NewDM";

const DM = () => {
  const { t } = useTranslation();

  return (
    <DMsProvider
      LoadingElement={<PageLoading />}
      ErrorElement={(error) => <PageError error={error} />}
    >
      <Layout hasSider>
        <Layout.Sider width={250}>
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
              <Route path=":boardId/*" element={<DMRoutes />} />
              <Route path="new" element={<NewDM />} />
              <Route path="*" element={<Navigate to="/chats" />} />
            </Route>
          </Routes>
        </Layout.Content>
      </Layout>
    </DMsProvider>
  );
};

export default DM;
