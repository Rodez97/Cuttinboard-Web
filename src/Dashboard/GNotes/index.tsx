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
import { GBoardProvider } from "@cuttinboard-solutions/cuttinboard-library";
import { recordError } from "../../utils/utils";
import EmptyExtended from "../../shared/molecules/EmptyExtended";

export default () => {
  const { t } = useTranslation();
  usePageTitle("Global Notes");

  return (
    <GBoardProvider boardCollection="notes" onError={recordError}>
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
                      "Create Note Boards accessible across all your locations",
                      "Publish important information that should be visible to all employees across all locations",
                      "Transmit and document company culture, guidelines and best practices across all your locations",
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
    </GBoardProvider>
  );
};
