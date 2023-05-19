/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Layout } from "antd/es";
import { Route, Routes } from "react-router-dom";
import FilesDrawersList from "./FilesDrawersList";
import { useTranslation } from "react-i18next";
import filesImage from "../../assets/images/drawer.png";
import { NotFound } from "../../shared";
import FilesMain from "./FilesMain";
import usePageTitle from "../../hooks/usePageTitle";
import { GBoardProvider } from "@cuttinboard-solutions/cuttinboard-library";
import { recordError } from "../../utils/utils";
import EmptyExtended from "./../../shared/molecules/EmptyExtended";

export default () => {
  const { t } = useTranslation();
  usePageTitle("Global Files");

  return (
    <GBoardProvider boardCollection="files" onError={recordError}>
      <Layout hasSider>
        <Layout.Sider
          width={250}
          breakpoint="lg"
          collapsedWidth="0"
          className="module-sider"
        >
          <FilesDrawersList />
        </Layout.Sider>
        <Layout.Content>
          <Routes>
            <Route path="/">
              <Route
                index
                element={
                  <EmptyExtended
                    descriptions={[
                      "Create file drawers accessible across all your locations",
                      "Store public files that should be accessible to all employees across all locations",
                      "Transmit and document company culture, guidelines and best practices across all your locations",
                    ]}
                    description={
                      <p>
                        {t("Welcome to Global Files")}.{" "}
                        <a
                          href="http://www.cuttinboard.com/help/global-files"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {t("Learn more")}
                        </a>
                      </p>
                    }
                    image={filesImage}
                  />
                }
              />
              <Route path=":boardId" element={<FilesMain />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Layout.Content>
      </Layout>
    </GBoardProvider>
  );
};
