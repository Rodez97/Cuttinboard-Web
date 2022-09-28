/** @jsx jsx */
import { jsx } from "@emotion/react";
import { orderBy } from "lodash";
import { useMemo, useRef, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useNavigate } from "react-router-dom";
import ManageNoteDialog, { ManageNoteDialogRef } from "./ManageNoteDialog";
import NoteCard from "./NoteCard";
import { useTranslation } from "react-i18next";
import PageError from "../../components/PageError";
import { useCuttinboardModule } from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  ModuleFirestoreConverter,
  Note,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import ToolBar from "../ToolBar";
import { Button, Empty, Layout, Space } from "antd";
import PageLoading from "../../components/PageLoading";
import Icon, { InfoCircleOutlined, TeamOutlined } from "@ant-design/icons";
import { NotePlus } from "./notesIcons";
import { GrayPageHeader } from "../../components/PageHeaders";
import { matchSorter } from "match-sorter";
import { EmptyMainModule } from "./EmptyMainModule";

const NoteConverter = ModuleFirestoreConverter<Note>();

function NotesMain() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [{ order, index, searchQuery }, setOrderData] = useState<{
    index: number;
    order: "desc" | "asc";
    searchQuery?: string;
  }>({
    index: 0,
    order: "asc",
    searchQuery: "",
  });
  const { selectedApp, canManage, moduleContentRef } = useCuttinboardModule();
  const manageNoteDialogRef = useRef<ManageNoteDialogRef>(null);
  const [notes, loading, error] = useCollectionData<Note>(
    moduleContentRef && moduleContentRef.withConverter(NoteConverter)
  );

  const handleCreateNote = () => {
    manageNoteDialogRef.current?.openNew();
  };

  const getOrderedNotes = useMemo(() => {
    let ordered: Note[] = [];

    switch (index) {
      case 0:
        ordered = orderBy(notes, "createdAt", order);
        break;
      case 1:
        ordered = orderBy(notes, "title", order);
        break;

      default:
        ordered = notes;
        break;
    }
    return matchSorter(ordered, searchQuery, {
      keys: ["title", "content"],
      sorter: (items) => items,
    });
  }, [notes, index, order, searchQuery]);

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError error={error} />;
  }

  return (
    <Layout.Content
      css={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <GrayPageHeader
        backIcon={<InfoCircleOutlined />}
        onBack={() => navigate("details")}
        title={selectedApp.name}
        subTitle={`(${Number(notes?.length)})`}
        extra={[
          <Button
            key="newNote"
            disabled={!canManage}
            onClick={handleCreateNote}
            icon={<Icon component={NotePlus} />}
            type="dashed"
          >
            {t("Add note")}
          </Button>,
          <Button
            key="members"
            type="primary"
            onClick={() => navigate(`members`)}
            icon={<TeamOutlined />}
          >
            {t("Members")}
          </Button>,
        ]}
      />
      <ToolBar
        options={["Creation", "Name"]}
        index={index}
        order={order}
        onChageOrder={(order) => setOrderData((prev) => ({ ...prev, order }))}
        onChange={(index) => setOrderData((prev) => ({ ...prev, index }))}
        searchQuery={searchQuery}
        onChangeSearchQuery={(sq) =>
          setOrderData((prev) => ({ ...prev, searchQuery: sq }))
        }
      />
      {getOrderedNotes.length ? (
        <Space wrap>
          {getOrderedNotes?.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              manageNoteDialogRef={manageNoteDialogRef}
            />
          ))}
        </Space>
      ) : (
        <EmptyMainModule
          description={
            <span>
              No notes. <a onClick={handleCreateNote}>Create one</a> or{" "}
              <a
                href="https://www.cuttinboard.com/help/understanding-the-notes-app"
                target="_blank"
              >
                learn more.
              </a>
            </span>
          }
        />
      )}

      <ManageNoteDialog ref={manageNoteDialogRef} />
    </Layout.Content>
  );
}

export default NotesMain;
