/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Layout } from "antd";
import { collection } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { Route, Routes } from "react-router-dom";
import NotesList from "./NotesList";
import notesImage from "../../assets/images/notes.png";
import { EmptyMainModule, PageError, PageLoading } from "../../components";
import { NotFound } from "../../components/NotFound";
import NotesMain from "./NotesMain";
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
        "notes"
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
                  <Route path=":boardId" element={<NotesMain />} />
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
