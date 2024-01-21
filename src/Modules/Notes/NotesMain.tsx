/** @jsx jsx */
import { jsx } from "@emotion/react";
import orderBy from "lodash-es/orderBy";
import { useLayoutEffect, useMemo, useState } from "react";
import ManageNoteDialog, { useManageNote } from "./ManageNoteDialog";
import NoteCard from "./Note";
import { useTranslation } from "react-i18next";
import ToolBar from "../ToolBar";
import { Button, Layout, Space, Tag } from "antd/es";
import Icon, {
  GlobalOutlined,
  InfoCircleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { NotePlus } from "./notesIcons";
import { matchSorter } from "match-sorter";
import {
  GrayPageHeader,
  NotFound,
  EmptyBoard,
  LoadingPage,
} from "../../shared";
import ModuleInfoDialog from "../ManageApp/ModuleInfoDialog";
import ManageModuleDialog, {
  useManageModule,
} from "../ManageApp/ManageModuleDialog";
import ModuleManageMembers from "../ManageApp/ModuleManageMembers";
import { useParams } from "react-router-dom";
import {
  NotesProvider,
  useBoard,
  useDisclose,
  useNotes,
} from "@rodez97/cuttinboard-library";
import ReadonlyNoteDialog, { useReadonlyNote } from "./ReadonlyNoteDialog";
import ErrorPage from "../../shared/molecules/PageError";
import NoItems from "../../shared/atoms/NoItems";

export default function NotesMain() {
  const { boardId } = useParams();
  if (!boardId) {
    throw new Error("No board id");
  }
  const { selectedBoard, selectBoardId, loading, error } = useBoard();

  useLayoutEffect(() => {
    if (boardId) {
      selectBoardId(boardId);
    }
    return () => {
      selectBoardId();
    };
  }, [boardId, selectBoardId]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPage error={error} />;
  }

  if (!selectedBoard) {
    return <NotFound />;
  }

  return (
    <NotesProvider selectedBoard={selectedBoard}>
      <Main />
    </NotesProvider>
  );
}

function Main() {
  const { selectedBoard, canManageBoard } = useBoard();
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
    order: "desc",
    searchQuery: "",
  });
  const { openNew, openEdit, manageNoteDialogRef } = useManageNote();
  const { open, readonlyNoteDialogRef } = useReadonlyNote();
  const { notes, loading, error } = useNotes();
  const [infoOpen, openInfo, closeInfo] = useDisclose();
  const [manageMembersOpen, openManageMembers, closeManageMembers] =
    useDisclose();
  const { baseRef, editModule } = useManageModule();

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
        return orderBy(filtered, (e) => e.createdAt ?? e.updatedAt, order);
      case 1:
        return orderBy(filtered, "title", order);
      default:
        return filtered;
    }
  }, [notes, index, order, searchQuery]);

  if (!selectedBoard) {
    return <EmptyBoard />;
  }

  if (error) {
    return <ErrorPage error={error} />;
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
        extra={
          selectedBoard.global ? (
            <Tag color="processing" icon={<GlobalOutlined />}>
              {t("Global Board")}
            </Tag>
          ) : (
            [
              !selectedBoard.global && canManageBoard && (
                <Button
                  key="newNote"
                  onClick={openNew}
                  icon={<Icon component={NotePlus} />}
                  type="dashed"
                >
                  {t("Add note")}
                </Button>
              ),
              <Button
                key="members"
                type="primary"
                onClick={openManageMembers}
                icon={<TeamOutlined />}
              >
                {t("Members")}
              </Button>,
            ]
          )
        }
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

      {loading ? (
        <LoadingPage />
      ) : getOrderedNotes.length > 0 ? (
        <Space wrap css={{ padding: 20, overflow: "auto" }}>
          {getOrderedNotes?.map((note) => (
            <NoteCard key={note.id} note={note} onSelect={open} />
          ))}
        </Space>
      ) : notes.length === 0 ? (
        <EmptyBoard
          description={
            <span>
              {t("No notes")}
              {". "}
              {!selectedBoard.global && canManageBoard && (
                <span>
                  <a onClick={openNew}>{t("Create one")}</a> {t("or")}{" "}
                </span>
              )}
              <a
                href="http://www.cuttinboard.com/help/notes"
                target="_blank"
                rel="noreferrer"
              >
                {t("Learn more")}
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
        canManage={Boolean(canManageBoard && !selectedBoard.global)}
        onEdit={openEdit}
      />
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
