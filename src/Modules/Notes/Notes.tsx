/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  useLocation,
  CuttinboardModuleProvider,
  Firestore,
} from "@cuttinboard/cuttinboard-library";
import { Layout } from "antd";
import { collection } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { Navigate, Route, Routes } from "react-router-dom";
import PageError from "../../components/PageError";
import PageLoading from "../../components/PageLoading";
import ManageModule from "../ManageApp/ManageModule";
import NotesList from "./NotesList";
import NotesRoutes from "./NotesRoutes";
import notesImage from "../../assets/images/notes.png";
import { EmptyMainModule } from "./EmptyMainModule";

function Notes() {
  const { t } = useTranslation();
  const { location } = useLocation();

  return (
    <CuttinboardModuleProvider
      baseRef={collection(
        Firestore,
        "Organizations",
        location.organizationId,
        "notes"
      )}
      LoadingElement={<PageLoading />}
      ErrorElement={(error) => <PageError error={error} />}
    >
      <Layout hasSider>
        <Layout.Sider width={250} breakpoint="lg" collapsedWidth="0">
          <NotesList />
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
                        {t("Welcome to Notes.")} <a>{t("Learn More")}</a>
                      </p>
                    }
                    image={notesImage}
                  />
                }
              />
              <Route path=":boardId/*" element={<NotesRoutes />} />
              <Route
                path="new"
                element={<ManageModule title="New Notes Board" />}
              />
              <Route path="*" element={<Navigate to="/apps/notes" />} />
            </Route>
          </Routes>
        </Layout.Content>
      </Layout>
    </CuttinboardModuleProvider>
  );
}
export default Notes;
