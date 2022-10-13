import { SaveFilled } from "@ant-design/icons";
import { Auth } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { Note } from "@cuttinboard-solutions/cuttinboard-library/models";
import { useCuttinboardModule } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Button, Form, Input, Modal } from "antd";
import { addDoc, serverTimestamp } from "firebase/firestore";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";

export interface ManageNoteDialogRef {
  openNew: () => void;
  openEdit: (note: Note) => void;
}

const ManageNoteDialog = forwardRef<ManageNoteDialogRef, unknown>((_, ref) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<{ title?: string; content: string }>();
  const { selectedApp } = useCuttinboardModule();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isSubmitting, setisSubmitting] = useState(false);
  const [baseNote, setBaseNote] = useState<Note>(null);

  useImperativeHandle(ref, () => ({
    openNew,
    openEdit,
  }));

  const openNew = () => {
    setTitle("Add note");
    setOpen(true);
  };

  const openEdit = (note: Note) => {
    setTitle("Edit note");
    setBaseNote(note);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setBaseNote(null);
    form.resetFields();
  };

  const onFinish = async (values: { title?: string; content: string }) => {
    setisSubmitting(true);
    try {
      if (baseNote) {
        await baseNote.edit(values.title, values.content);
      } else {
        await addDoc(selectedApp?.contentRef, {
          ...values,
          createdAt: serverTimestamp(),
          createdBy: Auth.currentUser.uid,
          authorName: Auth.currentUser.displayName,
        });
      }
      setisSubmitting(false);
      handleClose();
    } catch (error) {
      recordError(error);
      setisSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
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
      >
        <Form.Item name="title">
          <Input placeholder={t("Title")} maxLength={80} showCount />
        </Form.Item>
        <Form.Item
          name="content"
          required
          rules={[{ required: true, message: "" }]}
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

export default ManageNoteDialog;
