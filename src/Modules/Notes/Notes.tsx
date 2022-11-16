/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  useLocation,
  CuttinboardModuleProvider,
  Firestore,
} from "@cuttinboard-solutions/cuttinboard-library";
import { Layout } from "antd";
import { collection } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { Route, Routes } from "react-router-dom";
import NotesList from "./NotesList";
import NotesRoutes from "./NotesRoutes";
import notesImage from "../../assets/images/notes.png";
import { recordError } from "../../utils/utils";
import { EmptyMainModule, PageError, PageLoading } from "../../components";
import { NotFound } from "../../components/NotFound";

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
                  <Route path=":boardId" element={<NotesRoutes />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Layout.Content>
          </Layout>
        )
      }
    </CuttinboardModuleProvider>
  );
}
export default Notes;
