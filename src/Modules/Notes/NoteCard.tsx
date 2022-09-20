import { deleteDoc } from "firebase/firestore";
import React, { useState } from "react";
import ReadonlyNoteDialog from "./ReadonlyNoteDialog";
import { useTranslation } from "react-i18next";
import { StickyNoteCard } from "./StickyNoteCard";
import Linkify from "linkify-react";
import { ManageNoteDialogRef } from "./ManageNoteDialog";
import { Note } from "@cuttinboard/cuttinboard-library/models";
import { Card, Modal, Tooltip, Typography } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { recordError } from "../../utils/utils";

interface INoteCard {
  note: Note;
  manageNoteDialogRef: React.MutableRefObject<ManageNoteDialogRef>;
}

function NoteCard({ note, manageNoteDialogRef }: INoteCard) {
  const { t } = useTranslation();
  const [readonlyNoteDialogOpen, setReadonlyNoteDialogOpen] = useState(false);

  const handleEditNote = () => {
    manageNoteDialogRef.current.openEdit(note);
  };

  const handleDeleteNote = () => {
    Modal.confirm({
      title: t("Are you sure you want to delete this note?"),
      icon: <ExclamationCircleOutlined />,

      async onOk() {
        try {
          await deleteDoc(note.docRef);
        } catch (error) {
          recordError(error);
        }
      },
      onCancel() {},
    });
  };

  const handleClick = () => {
    setReadonlyNoteDialogOpen(true);
  };

  return (
    <>
      <Tooltip title={note.title}>
        <StickyNoteCard hoverable onClick={handleClick} bordered={false}>
          <Card.Meta
            title={note.title}
            description={
              <Typography.Paragraph
                ellipsis={{ rows: 8, expandable: false, symbol: "..." }}
              >
                <Linkify
                  options={{
                    target: "_blank",
                    rel: "noreferrer noopener",
                    className: "linkifyInnerStyle",
                  }}
                >
                  {note.content}
                </Linkify>
              </Typography.Paragraph>
            }
          />
        </StickyNoteCard>
      </Tooltip>
      <ReadonlyNoteDialog
        note={note}
        open={readonlyNoteDialogOpen}
        onClose={() => setReadonlyNoteDialogOpen(false)}
        onEdit={handleEditNote}
        onDelete={handleDeleteNote}
      />
    </>
  );
}

export default NoteCard;
