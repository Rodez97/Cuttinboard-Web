/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Firestore } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import {
  CuttinboardModuleProvider,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { Layout } from "antd";
import { collection } from "firebase/firestore";
import { Navigate, Route, Routes } from "react-router-dom";
import PageError from "../../components/PageError";
import PageLoading from "../../components/PageLoading";
import ManageModule from "../ManageApp/ManageModule";
import TasksList from "./TasksList";
import TasksRoutes from "./TasksRoutes";
import tasksImage from "../../assets/images/to-do-list.png";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";
import { EmptyMainModule } from "../../components";

function Tasks() {
  const { t } = useTranslation();
  const { location } = useLocation();
  return (
    <CuttinboardModuleProvider
      baseRef={collection(
        Firestore,
        "Organizations",
        location.organizationId,
        "todo"
      )}
      onError={recordError}
    >
      {({ loading, error }) =>
        loading ? (
          <PageLoading />
        ) : error ? (
          <PageError error={error} />
        ) : (
          <Layout hasSider>
            <Layout.Sider width={250} breakpoint="lg" collapsedWidth="0">
              <TasksList />
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
                            {t("Welcome to Tasks.")} <a>{t("Learn More")}</a>
                          </p>
                        }
                        image={tasksImage}
                      />
                    }
                  />
                  <Route path=":boardId/*" element={<TasksRoutes />} />
                  <Route path="new" element={<ManageModule />} />
                  <Route path="*" element={<Navigate to="/apps/to-do" />} />
                </Route>
              </Routes>
            </Layout.Content>
          </Layout>
        )
      }
    </CuttinboardModuleProvider>
  );
}

export default Tasks;
