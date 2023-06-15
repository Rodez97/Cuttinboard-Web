/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Layout } from "antd/es";
import { Route, Routes } from "react-router-dom";
import FilesDrawersList from "./FilesDrawersList";
import { useTranslation } from "react-i18next";
import filesImage from "../../assets/images/drawer.png";
import { NotFound } from "../../shared";
import FilesMain from "./FilesMain";
import { BoardProvider } from "@cuttinboard-solutions/cuttinboard-library";
import usePageTitle from "../../hooks/usePageTitle";
import EmptyExtended from "../../shared/molecules/EmptyExtended";
import { useDrawerSider } from "../../shared/organisms/useDrawerSider";

export default () => {
  const { t } = useTranslation();
  usePageTitle("Files");
  const { DrawerSider, DrawerHeaderControl } = useDrawerSider();

  return (
    <BoardProvider boardCollection="files">
      <DrawerHeaderControl title={t("Files")} />
      <Layout hasSider>
        <DrawerSider>
          <FilesDrawersList />
        </DrawerSider>
        {/* <Layout.Sider
          width={250}
          breakpoint="lg"
          collapsedWidth="0"
          className="module-sider"
        >
          <FilesDrawersList />
        </Layout.Sider> */}
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
                        {t("Welcome to Files")}.{" "}
                        <a
                          href="http://www.cuttinboard.com/help/files"
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
    </BoardProvider>
  );
};
