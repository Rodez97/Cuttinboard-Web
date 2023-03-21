/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Layout } from "antd";
import { useTranslation } from "react-i18next";
import { Route, Routes } from "react-router-dom";
import NotesList from "./NotesList";
import notesImage from "../../assets/images/notes.png";
import { NotFound } from "../../shared";
import NotesMain from "./NotesMain";
import usePageTitle from "../../hooks/usePageTitle";
import { BoardProvider } from "@cuttinboard-solutions/cuttinboard-library";
import EmptyExtended from "../../shared/molecules/EmptyExtended";

export default () => {
  const { t } = useTranslation();
  usePageTitle("Notes");

  return (
    <BoardProvider boardCollection="notes">
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
                  <EmptyExtended
                    descriptions={[
                      "Share important written information with your team",
                      "Document bite-sized information that can be consulted over and over again",
                      "Create a knowledge base of policies, steps, guidelines, best practices and procedures for training employees",
                      "Store useful links",
                    ]}
                    description={
                      <p>
                        {t("Welcome to Notes")}. <a>{t("Learn More")}</a>
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
    </BoardProvider>
  );
};
