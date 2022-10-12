import { DeleteFilled, EditFilled, UserOutlined } from "@ant-design/icons";
import { Note } from "@cuttinboard-solutions/cuttinboard-library/models";
import { useCuttinboardModule } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Button, Modal, Tag, Typography } from "antd";
import Linkify from "linkify-react";
import React from "react";
import { useTranslation } from "react-i18next";

interface ReadonlyNoteDialogProps {
  note: Note;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  open: boolean;
}

function ReadonlyNoteDialog({
  note,
  onClose,
  onEdit,
  onDelete,
  open,
}: ReadonlyNoteDialogProps) {
  const { canManage } = useCuttinboardModule();
  const { t } = useTranslation();

  const handleEdit = () => {
    onClose();
    onEdit();
  };

  return (
    <Modal
      open={open}
      title={note.title}
      onCancel={onClose}
      footer={[
        <Button
          key="delete"
          onClick={onDelete}
          disabled={!canManage}
          danger
          icon={<DeleteFilled />}
        >
          {t("Delete")}
        </Button>,
        <Button
          key="edit"
          onClick={handleEdit}
          disabled={!canManage}
          icon={<EditFilled />}
          type="dashed"
        >
          {t("Edit")}
        </Button>,
        <Button key="ok" onClick={onClose} type="primary">
          OK
        </Button>,
      ]}
    >
      <Typography.Paragraph
        style={{
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
      {note.authorName && <Tag icon={<UserOutlined />}>{note.authorName}</Tag>}
    </Modal>
  );
}

export default ReadonlyNoteDialog;
