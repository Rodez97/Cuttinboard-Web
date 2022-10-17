/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Firestore } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import {
  CuttinboardModuleProvider,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { collection } from "@firebase/firestore";
import { Layout } from "antd";
import { Navigate, Route, Routes } from "react-router-dom";
import PageError from "../../components/PageError";
import PageLoading from "../../components/PageLoading";
import ManageModule from "../ManageApp/ManageModule";
import FilesDrawersList from "./FilesDrawersList";
import FilesRoutes from "./FilesRoutes";
import { EmptyMainModule } from "../Notes/EmptyMainModule";
import { useTranslation } from "react-i18next";
import filesImage from "../../assets/images/drawer.png";
import { recordError } from "../../utils/utils";

function Files() {
  const { t } = useTranslation();
  const { location } = useLocation();
  return (
    <CuttinboardModuleProvider
      baseRef={collection(
        Firestore,
        "Organizations",
        location.organizationId,
        "storage"
      )}
      onError={recordError}
    >
      {(loading, error) =>
        loading ? (
          <PageLoading />
        ) : error ? (
          <PageError error={error} />
        ) : (
          <Layout hasSider>
            <Layout.Sider width={250} breakpoint="lg" collapsedWidth="0">
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
                  <Route path=":boardId/*" element={<FilesRoutes />} />
                  <Route path="new" element={<ManageModule />} />
                  <Route path="*" element={<Navigate to="/apps/storage" />} />
                </Route>
              </Routes>
            </Layout.Content>
          </Layout>
        )
      }
    </CuttinboardModuleProvider>
  );
}

export default Files;
