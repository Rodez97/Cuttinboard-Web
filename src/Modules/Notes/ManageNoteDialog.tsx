import { SaveFilled } from "@ant-design/icons";
import {
  Note,
  useBoard,
} from "@cuttinboard-solutions/cuttinboard-library/boards";
import { useDisclose } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Button, Form, Input, Modal } from "antd";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";

export interface ManageNoteDialogRef {
  openNew: () => void;
  openEdit: (note: Note) => void;
}

export default forwardRef<ManageNoteDialogRef, unknown>((_, ref) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<{ title?: string; content: string }>();
  const { selectedBoard } = useBoard();
  const [isOpen, open, close] = useDisclose(false);
  const [title, setTitle] = useState("");
  const [isSubmitting, startSubmit, endSubmit] = useDisclose();
  const [baseNote, setBaseNote] = useState<Note | null>(null);

  useImperativeHandle(ref, () => ({
    openNew,
    openEdit,
  }));

  const openNew = () => {
    setTitle("Add note");
    open();
  };

  const openEdit = (note: Note) => {
    setTitle("Edit note");
    setBaseNote(note);
    open();
  };

  const handleClose = () => {
    close();
    setBaseNote(null);
    form.resetFields();
  };

  const onFinish = async (values: { title?: string; content: string }) => {
    startSubmit();
    try {
      if (baseNote) {
        await baseNote.update(values);
      } else if (selectedBoard) {
        await Note.NewNote(selectedBoard.contentRef, values);
      }
      endSubmit();
      handleClose();
    } catch (error) {
      recordError(error);
      endSubmit();
    }
  };

  return (
    <Modal
      open={isOpen}
      title={t(title)}
      onCancel={handleClose}
      footer={[
        <Button disabled={isSubmitting} onClick={handleClose} key="cancel">
          {t("Cancel")}
        </Button>,
        <Button
          type="primary"
          icon={<SaveFilled />}
          loading={isSubmitting}
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
        disabled={isSubmitting}
        initialValues={{ title: baseNote?.title, content: baseNote?.content }}
        autoComplete="off"
      >
        <Form.Item
          name="title"
          rules={[
            {
              whitespace: true,
              message: t("Cannot be empty"),
            },
            // Check that the title does not have leading or trailing spaces
            {
              pattern: /^\S.*\S$/,
              message: t("Cannot start or end with spaces"),
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
            // Check that the title does not have leading or trailing spaces
            {
              pattern: /^\S.*\S$/,
              message: t("Cannot start or end with spaces"),
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
});
