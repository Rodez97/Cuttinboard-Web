/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useState } from "react";
import ReadonlyNoteDialog from "./ReadonlyNoteDialog";
import { useTranslation } from "react-i18next";
import Linkify from "linkify-react";
import { Card, Modal, Tooltip, Typography } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { recordError } from "../../utils/utils";
import { Note } from "@cuttinboard-solutions/cuttinboard-library/boards";
import { StickyNote } from "../../shared";

interface INoteCard {
  note: Note;
  onEdit: (note: Note) => void;
}

export default ({ note, onEdit }: INoteCard) => {
  const { t } = useTranslation();
  const [readonlyNoteDialogOpen, setReadonlyNoteDialogOpen] = useState(false);

  const handleEditNote = () => {
    onEdit(note);
  };

  const handleDeleteNote = () => {
    Modal.confirm({
      title: t("Are you sure you want to delete this note?"),
      icon: <ExclamationCircleOutlined />,

      async onOk() {
        try {
          await note.delete();
        } catch (error) {
          recordError(error);
        }
      },
    });
  };

  const handleClick = () => {
    setReadonlyNoteDialogOpen(true);
  };

  const linkProps = {
    onClick: (event: MouseEvent) => {
      event.preventDefault();
    },
  };

  return (
    <React.Fragment>
      <Tooltip title={note.title}>
        <StickyNote hoverable onClick={handleClick} bordered={false}>
          <Card.Meta
            title={note.title}
            description={
              <Typography.Paragraph
                ellipsis={{ rows: 8, expandable: false, symbol: "..." }}
                css={{
                  wordBreak: "break-word",
                  whiteSpace: "pre-line",
                }}
              >
                <Linkify
                  options={{
                    target: "_blank",
                    rel: "noreferrer noopener",
                    className: "linkifyInnerStyle",
                    attributes: linkProps,
                  }}
                >
                  {note.content}
                </Linkify>
              </Typography.Paragraph>
            }
          />
        </StickyNote>
      </Tooltip>
      <ReadonlyNoteDialog
        note={note}
        open={readonlyNoteDialogOpen}
        onClose={() => setReadonlyNoteDialogOpen(false)}
        onEdit={handleEditNote}
        onDelete={handleDeleteNote}
      />
    </React.Fragment>
  );
};
