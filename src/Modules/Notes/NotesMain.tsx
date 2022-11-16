/** @jsx jsx */
import { jsx } from "@emotion/react";
import { orderBy } from "lodash";
import { useMemo, useRef, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import ManageNoteDialog, { ManageNoteDialogRef } from "./ManageNoteDialog";
import NoteCard from "./NoteCard";
import { useTranslation } from "react-i18next";
import { useCuttinboardModule } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Note } from "@cuttinboard-solutions/cuttinboard-library/models";
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
import { useDisclose } from "../../hooks";
import ManageModuleDialog, {
  useManageModule,
} from "../ManageApp/ManageModuleDialog";
import ModuleManageMembers from "../ManageApp/ModuleManageMembers";

function NotesMain() {
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
  const { selectedApp, canManage } = useCuttinboardModule();
  const manageNoteDialogRef = useRef<ManageNoteDialogRef>(null);
  const [notes, loading, error] = useCollectionData<Note>(
    selectedApp && selectedApp.contentRef.withConverter(Note.Converter)
  );
  const [infoOpen, openInfo, closeInfo] = useDisclose();
  const [manageMembersOpen, openManageMembers, closeManageMembers] =
    useDisclose();
  const { baseRef, editModule } = useManageModule();

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
        onBack={openInfo}
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
        onChageOrder={(order) => setOrderData((prev) => ({ ...prev, order }))}
        onChange={(index) => setOrderData((prev) => ({ ...prev, index }))}
        searchQuery={searchQuery}
        onChangeSearchQuery={(sq) =>
          setOrderData((prev) => ({ ...prev, searchQuery: sq }))
        }
      />
      {getOrderedNotes.length ? (
        <Space wrap css={{ padding: 20, overflow: "auto" }}>
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
      <ManageModuleDialog ref={baseRef} moduleName="Notes Stack" />
      <ModuleInfoDialog
        open={infoOpen}
        onCancel={closeInfo}
        onEdit={() => {
          closeInfo();
          editModule(selectedApp);
        }}
      />
      <ModuleManageMembers
        open={manageMembersOpen}
        onCancel={closeManageMembers}
      />
    </Layout.Content>
  );
}

export default NotesMain;
