/** @jsx jsx */
import { jsx } from "@emotion/react";
import { orderBy } from "lodash";
import { useLayoutEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Layout, Space } from "antd";
import Icon, { InfoCircleOutlined } from "@ant-design/icons";
import { matchSorter } from "match-sorter";
import {
  GrayPageHeader,
  NotFound,
  EmptyBoard,
  LoadingPage,
} from "../../shared";
import { useParams } from "react-router-dom";
import ToolBar from "../../Modules/ToolBar";
import BoardInfo from "../BoardInfo";
import ManageBoard, { useManageBoard } from "../ManageBoard";
import ManageNoteDialog, {
  useManageNote,
} from "../../Modules/Notes/ManageNoteDialog";
import ReadonlyNoteDialog, {
  useReadonlyNote,
} from "../../Modules/Notes/ReadonlyNoteDialog";
import { NotePlus } from "../../Modules/Notes/notesIcons";
import NoteCard from "../../Modules/Notes/Note";
import {
  useDisclose,
  useGBoard,
  useNotes,
  useNotesData,
} from "@cuttinboard-solutions/cuttinboard-library";
import ErrorPage from "../../shared/molecules/PageError";
import NoItems from "../../shared/atoms/NoItems";

export default function NotesMain() {
  const { boardId } = useParams();
  if (!boardId) {
    throw new Error("No board id");
  }
  const { selectedBoard, selectActiveBoard, loading, error } = useGBoard();

  useLayoutEffect(() => {
    if (boardId) {
      selectActiveBoard(boardId);
    }
    return () => {
      selectActiveBoard();
    };
  }, [boardId, selectActiveBoard]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPage error={new Error(error)} />;
  }

  if (!selectedBoard) {
    return <NotFound />;
  }

  return <Main />;
}

function Main() {
  const { selectedBoard } = useGBoard();
  if (!selectedBoard) {
    throw new Error("No board selected");
  }
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
  const { openNew, openEdit, manageNoteDialogRef } = useManageNote();
  const { open, readonlyNoteDialogRef } = useReadonlyNote();
  const { notes } = useNotes(selectedBoard);
  const [infoOpen, openInfo, closeInfo] = useDisclose();
  const { baseRef, editBoard } = useManageBoard();

  useNotesData(selectedBoard);

  // Define a function to filter, sort, and memoize the list of notes
  const getOrderedNotes = useMemo(() => {
    // Return an empty array if the notes are not provided
    if (!notes) {
      return [];
    }

    // Filter the list of notes based on the search query
    let filtered = notes;
    if (searchQuery) {
      filtered = matchSorter(notes, searchQuery, {
        keys: ["title", "content"],
      });
    }

    // Sort the list of notes based on the index and order parameters
    switch (index) {
      case 0:
        return orderBy(filtered, (e) => e.updatedAt, order);
      case 1:
        return orderBy(filtered, "title", order);
      default:
        return filtered;
    }
  }, [notes, index, order, searchQuery]);

  if (!selectedBoard) {
    return <EmptyBoard />;
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
            onClick={openNew}
            icon={<Icon component={NotePlus} />}
            type="dashed"
          >
            {t("Add note")}
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
            <NoteCard key={note.id} note={note} onSelect={open} />
          ))}
        </Space>
      ) : notes.length === 0 ? (
        <EmptyBoard
          description={
            <span>
              {t("No notes")}. <a onClick={openNew}>{t("Create one")}</a>{" "}
              {t("or")}{" "}
              <a
                href="https://www.cuttinboard.com/help/understanding-the-notes-app"
                target="_blank"
                rel="noreferrer"
              >
                {t("learn more")}
              </a>
            </span>
          }
        />
      ) : (
        <NoItems />
      )}

      <ManageNoteDialog
        ref={manageNoteDialogRef}
        selectedBoard={selectedBoard}
      />
      <ReadonlyNoteDialog
        ref={readonlyNoteDialogRef}
        selectedBoard={selectedBoard}
        canManage={true}
        onEdit={openEdit}
      />
      <ManageBoard ref={baseRef} moduleName="Notes Stack" />
      <BoardInfo
        open={infoOpen}
        onCancel={closeInfo}
        onEdit={() => {
          closeInfo();
          editBoard(selectedBoard);
        }}
      />
    </Layout.Content>
  );
}
