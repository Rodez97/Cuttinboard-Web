/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  DeleteFilled,
  EditFilled,
  EditOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Modal, Tag, Typography } from "antd";
import Linkify from "linkify-react";
import { useTranslation } from "react-i18next";
import {
  Note,
  useBoard,
} from "@cuttinboard-solutions/cuttinboard-library/boards";

interface ReadonlyNoteDialogProps {
  note: Note;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  open: boolean;
}

export default ({
  note,
  onClose,
  onEdit,
  onDelete,
  open,
}: ReadonlyNoteDialogProps) => {
  const { canManageBoard } = useBoard();
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
          disabled={!canManageBoard}
          danger
          icon={<DeleteFilled />}
        >
          {t("Delete")}
        </Button>,
        <Button
          key="edit"
          onClick={handleEdit}
          disabled={!canManageBoard}
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
        {t("Created by:")} {note.author.name}
      </Tag>
      {note.updated && (
        <Tag icon={<EditOutlined />}>
          {t("Last updated:")} {note.updated.at.toDate().toLocaleString()}{" "}
          {t("by")} {note.updated.name}
        </Tag>
      )}
    </Modal>
  );
};
