/** @jsx jsx */
import { jsx } from "@emotion/react";
import { collection } from "@firebase/firestore";
import { Layout } from "antd";
import { Route, Routes } from "react-router-dom";
import FilesDrawersList from "./FilesDrawersList";
import { useTranslation } from "react-i18next";
import filesImage from "../../assets/images/drawer.png";
import { EmptyMainModule, PageError, PageLoading } from "../../components";
import { NotFound } from "../../components/NotFound";
import FilesMain from "./FilesMain";
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import { BoardProvider } from "@cuttinboard-solutions/cuttinboard-library/boards";
import { FIRESTORE } from "@cuttinboard-solutions/cuttinboard-library/utils";

export default () => {
  const { t } = useTranslation();
  const { location } = useCuttinboardLocation();

  return (
    <BoardProvider
      baseRef={collection(
        FIRESTORE,
        "Organizations",
        location.organizationId,
        "storage"
      )}
    >
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
              <FilesDrawersList />
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
                            {t("Welcome to Files.")} <a>{t("Learn More")}</a>
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
        )
      }
    </BoardProvider>
  );
};
