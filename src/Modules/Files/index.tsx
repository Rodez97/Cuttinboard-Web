/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Layout } from "antd";
import { Route, Routes } from "react-router-dom";
import FilesDrawersList from "./FilesDrawersList";
import { useTranslation } from "react-i18next";
import filesImage from "../../assets/images/drawer.png";
import { NotFound } from "../../shared";
import FilesMain from "./FilesMain";
import { BoardProvider } from "@cuttinboard-solutions/cuttinboard-library";
import usePageTitle from "../../hooks/usePageTitle";
import EmptyExtended from "../../shared/molecules/EmptyExtended";

export default () => {
  const { t } = useTranslation();
  usePageTitle("Files");

  return (
    <BoardProvider boardCollection="files">
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
                      "Share important files with your team",
                      "Share training materials and manuals with new hires",
                      "Store digital documents and enjoy the advantages of a paperless system",
                    ]}
                    description={
                      <p>
                        {t("Welcome to Files")}. <a>{t("Learn More")}</a>
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
    </BoardProvider>
  );
};
