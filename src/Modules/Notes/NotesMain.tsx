/** @jsx jsx */
import { jsx } from "@emotion/react";
import { orderBy } from "lodash";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import ManageNoteDialog, { ManageNoteDialogRef } from "./ManageNoteDialog";
import NoteCard from "./Note";
import { useTranslation } from "react-i18next";
import ToolBar from "../ToolBar";
import { Button, Layout, Space } from "antd";
import Icon, { InfoCircleOutlined, TeamOutlined } from "@ant-design/icons";
import { NotePlus } from "./notesIcons";
import { matchSorter } from "match-sorter";
import {
  EmptyMainModule,
  GrayPageHeader,
  PageError,
  PageLoading,
} from "../../components";
import ModuleInfoDialog from "../ManageApp/ModuleInfoDialog";
import ManageModuleDialog, {
  useManageModule,
} from "../ManageApp/ManageModuleDialog";
import ModuleManageMembers from "../ManageApp/ModuleManageMembers";
import { useParams } from "react-router-dom";
import { NotFound } from "../../components/NotFound";
import {
  Note,
  useBoard,
} from "@cuttinboard-solutions/cuttinboard-library/boards";
import { useDisclose } from "@cuttinboard-solutions/cuttinboard-library/utils";

export default () => {
  const { boardId } = useParams();
  const { selectedBoard, selectBoard } = useBoard();

  useLayoutEffect(() => {
    if (boardId) {
      selectBoard(boardId);
    }
    return () => {
      selectBoard("");
    };
  }, [boardId, selectBoard]);

  if (!selectedBoard) {
    return <NotFound />;
  }

  return <Main />;
};

function Main() {
  const { t } = useTranslation();
  const [{ order, index, searchQuery }, setOrderData] = useState<{
    index: number;
    order: "desc" | "asc";
    searchQuery?: string;
  }>({
    index: 0,
    order: "asc",
    searchQuery: "",
  });
  const { selectedBoard, canManageBoard } = useBoard();
  const manageNoteDialogRef = useRef<ManageNoteDialogRef>(null);
  const [notes, loading, error] = useCollectionData<Note>(
    selectedBoard &&
      selectedBoard.contentRef.withConverter(Note.firestoreConverter)
  );
  const [infoOpen, openInfo, closeInfo] = useDisclose();
  const [manageMembersOpen, openManageMembers, closeManageMembers] =
    useDisclose();
  const { baseRef, editModule } = useManageModule();

  const handleCreateNote = () => {
    manageNoteDialogRef.current?.openNew();
  };

  const getOrderedNotes = useMemo(() => {
    if (!notes) {
      return [];
    }

    const filtered: Note[] = searchQuery
      ? matchSorter(notes, searchQuery, {
          keys: ["title", "content"],
        })
      : notes;

    switch (index) {
      case 0:
        return orderBy(filtered, (e) => e.author.at.toDate(), order);
      case 1:
        return orderBy(filtered, "title", order);
      default:
        return filtered;
    }
  }, [notes, index, order, searchQuery]);

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError error={error} />;
  }

  if (!selectedBoard) {
    return <EmptyMainModule />;
  }

  return (
    <Layout.Content
      css={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <GrayPageHeader
        backIcon={<InfoCircleOutlined />}
        onBack={openInfo}
        title={selectedBoard.name}
        subTitle={`(${notes ? notes.length : 0})`}
        extra={[
          <Button
            key="newNote"
            disabled={!canManageBoard}
            onClick={handleCreateNote}
            icon={<Icon component={NotePlus} />}
            type="dashed"
          >
            {t("Add note")}
          </Button>,
          <Button
            key="members"
            type="primary"
            onClick={openManageMembers}
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
        onChangeOrder={(order) => setOrderData((prev) => ({ ...prev, order }))}
        onChange={(index) => setOrderData((prev) => ({ ...prev, index }))}
        searchQuery={searchQuery}
        onChangeSearchQuery={(sq) =>
          setOrderData((prev) => ({ ...prev, searchQuery: sq }))
        }
      />
      {getOrderedNotes.length > 0 ? (
        <Space wrap css={{ padding: 20, overflow: "auto" }}>
          {getOrderedNotes?.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => manageNoteDialogRef.current?.openEdit(note)}
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
                rel="noreferrer"
              >
                learn more.
              </a>
            </span>
          }
        />
      )}

      <ManageNoteDialog ref={manageNoteDialogRef} />
      <ManageModuleDialog ref={baseRef} moduleName="Notes Stack" />
      <ModuleInfoDialog
        open={infoOpen}
        onCancel={closeInfo}
        onEdit={() => {
          closeInfo();
          editModule(selectedBoard);
        }}
      />
      <ModuleManageMembers
        open={manageMembersOpen}
        onCancel={closeManageMembers}
      />
    </Layout.Content>
  );
}
