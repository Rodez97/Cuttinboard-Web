import { SaveFilled } from "@ant-design/icons";
import {
  useCuttinboard,
  useDisclose,
  useNotes,
} from "@cuttinboard-solutions/cuttinboard-library";
import { IBoard, INote } from "@cuttinboard-solutions/types-helpers";
import { Button, Form, Input, Modal } from "antd";
import { Timestamp } from "firebase/firestore";
import { nanoid } from "nanoid";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

interface ManageNoteDialogRef {
  openNew: () => void;
  openEdit: (note: INote) => void;
}
interface ManageNoteDialogProps {
  selectedBoard: IBoard;
}

export default forwardRef<ManageNoteDialogRef, ManageNoteDialogProps>(
  ({ selectedBoard }, ref) => {
    const { user } = useCuttinboard();
    const { t } = useTranslation();
    const [form] = Form.useForm<{ title?: string; content: string }>();
    const [isOpen, open, close] = useDisclose(false);
    const [title, setTitle] = useState("");
    const [baseNote, setBaseNote] = useState<INote>();
    const { updateNote, addNote } = useNotes(selectedBoard);

    useImperativeHandle(ref, () => ({
      openNew,
      openEdit,
    }));

    const openNew = () => {
      setTitle("Add note");
      open();
    };

    const openEdit = (note: INote) => {
      setTitle("Edit note");
      setBaseNote(note);
      form.setFieldsValue({
        title: note.title,
        content: note.content,
      });
      open();
    };

    const handleClose = () => {
      close();
      setBaseNote(undefined);
      form.resetFields();
    };

    const onFinish = (values: { title?: string; content: string }) => {
      // Normalize values to avoid leading/trailing spaces
      const title = values.title ? values.title.trim() : "";
      const content = values.content ? values.content.trim() : "";
      if (baseNote) {
        updateNote(baseNote, {
          title,
          content,
        });
      } else if (selectedBoard) {
        const newId = nanoid();
        const newNote: INote = {
          title,
          content,
          id: newId,
          refPath: `${selectedBoard.refPath}/content/${newId}`,
          createdAt: Timestamp.now().toMillis(),
          createdBy: {
            id: user.uid,
            name: user.displayName ?? user.email ?? user.uid,
          },
        };
        addNote(newNote);
      }
      handleClose();
    };

    return (
      <Modal
        open={isOpen}
        title={t(title)}
        onCancel={handleClose}
        footer={[
          <Button onClick={handleClose} key="cancel">
            {t("Cancel")}
          </Button>,
          <Button
            type="primary"
            icon={<SaveFilled />}
            onClick={() => form.submit()}
            key="accept"
          >
            {t("Accept")}
          </Button>,
        ]}
      >
        <Form<{ title?: string; content: string }>
          form={form}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="title"
            rules={[
              {
                whitespace: true,
                message: t("Cannot be empty"),
              },
            ]}
          >
            <Input placeholder={t("Title")} maxLength={80} showCount />
          </Form.Item>
          <Form.Item
            name="content"
            required
            rules={[
              { required: true, message: t("Cannot be empty") },
              {
                whitespace: true,
                message: t("Cannot be empty"),
              },
              {
                max: 4000,
                message: t("Cannot be longer than 4000 characters"),
              },
            ]}
          >
            <Input.TextArea
              placeholder={t("Content")}
              maxLength={4000}
              showCount
              rows={10}
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
);

export const useManageNote = () => {
  const manageNoteDialogRef = useRef<ManageNoteDialogRef>(null);

  const openNew = () => {
    manageNoteDialogRef.current?.openNew();
  };

  const openEdit = (note: INote) => {
    manageNoteDialogRef.current?.openEdit(note);
  };

  return { openNew, openEdit, manageNoteDialogRef };
};
