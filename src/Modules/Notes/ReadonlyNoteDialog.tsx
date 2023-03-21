/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  DeleteFilled,
  EditFilled,
  EditOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Modal, Tag, Typography } from "antd";
import Linkify from "linkify-react";
import { useTranslation } from "react-i18next";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import dayjs from "dayjs";
import {
  useDisclose,
  useNotes,
} from "@cuttinboard-solutions/cuttinboard-library";
import { IBoard, INote } from "@cuttinboard-solutions/types-helpers";

export const useReadonlyNote = () => {
  const readonlyNoteDialogRef = useRef<ReadonlyNoteDialogRef>(null);

  const open = (note: INote) => {
    readonlyNoteDialogRef.current?.open(note);
  };

  return { open, readonlyNoteDialogRef };
};

interface ReadonlyNoteDialogRef {
  open: (note: INote) => void;
}

interface ReadonlyNoteDialogProps {
  onEdit: (note: INote) => void;
  canManage: boolean;
  selectedBoard: IBoard;
}

const ReadonlyNoteDialog = forwardRef<
  ReadonlyNoteDialogRef,
  ReadonlyNoteDialogProps
>(({ onEdit, canManage, selectedBoard }, ref) => {
  const [isOpen, openDialog, closeDialog] = useDisclose();
  const [note, setNote] = useState<INote>();
  const { t } = useTranslation();
  const { deleteNote } = useNotes(selectedBoard);

  useImperativeHandle(ref, () => ({
    open,
  }));

  const open = (note: INote) => {
    setNote(note);
    openDialog();
  };

  const handleEdit = () => {
    if (!note) {
      return;
    }
    onEdit(note);
    closeDialog();
  };

  const handleDelete = () => {
    if (!note) {
      return;
    }
    Modal.confirm({
      title: t("Are you sure you want to delete this note?"),
      icon: <ExclamationCircleOutlined />,
      onOk() {
        deleteNote(note);
        closeDialog();
      },
    });
  };

  if (!note) {
    return null;
  }

  return (
    <Modal
      open={isOpen}
      title={note.title}
      onCancel={closeDialog}
      footer={[
        canManage && (
          <Button
            key="delete"
            onClick={handleDelete}
            danger
            icon={<DeleteFilled />}
          >
            {t("Delete")}
          </Button>
        ),
        canManage && (
          <Button
            key="edit"
            onClick={handleEdit}
            icon={<EditFilled />}
            type="dashed"
          >
            {t("Edit")}
          </Button>
        ),
        <Button key="ok" onClick={closeDialog} type="primary">
          OK
        </Button>,
      ]}
    >
      <Typography.Paragraph
        css={{
          wordBreak: "break-word",
          color: "inherit",
          whiteSpace: "pre-line",
        }}
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
      <Tag icon={<UserOutlined />}>
        {t("Created by:")} {note.createdBy.name}
      </Tag>
      {note.updatedAt && note.updatedBy?.name && (
        <Tag icon={<EditOutlined />}>
          {t("Last updated:")} {dayjs(note.updatedAt).toLocaleString()}{" "}
          {t("by")} {note.updatedBy.name}
        </Tag>
      )}
    </Modal>
  );
});

export default ReadonlyNoteDialog;
