import { SaveFilled } from "@ant-design/icons";
import {
  Auth,
  Firestore,
} from "@cuttinboard-solutions/cuttinboard-library/firebase";
import {
  Checklist_Section,
  LocationCheckList,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { useLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Button, Form, Input, Modal } from "antd";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { capitalize } from "lodash";
import { nanoid } from "nanoid";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDisclose } from "../../hooks";
import { recordError } from "../../utils/utils";

export interface ManageSectionDialogRef {
  openNew: () => void;
  openEdit: (sectionId: string) => void;
}

type ManageSectionDialogProps = {
  rootChecklist?: LocationCheckList;
};

type FormType = {
  name: string;
  description?: string;
  tag?: string;
};

const ManageSectionDialog = forwardRef<
  ManageSectionDialogRef,
  ManageSectionDialogProps
>(({ rootChecklist }, ref) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<FormType>();
  const [isOpen, open, close] = useDisclose(false);
  const { location } = useLocation();
  const [title, setTitle] = useState("");
  const [isSubmitting, startSubmit, endSubmit] = useDisclose();
  const [section, setSection] = useState<{
    sectionId: string;
    section: Checklist_Section;
  }>(null);

  useImperativeHandle(ref, () => ({
    openNew,
    openEdit,
  }));

  const openNew = () => {
    setTitle("New Section");
    open();
  };

  const openEdit = (sectionId: string) => {
    setTitle("Edit Section");
    setSection({ sectionId, section: rootChecklist.sections[sectionId] });
    open();
  };

  const handleClose = () => {
    close();
    setSection(null);
    form.resetFields();
  };

  const onFinish = async (values: FormType) => {
    startSubmit();
    try {
      if (section) {
        await rootChecklist.updateSection(section.sectionId, values);
      } else if (rootChecklist) {
        await rootChecklist.addSection(nanoid(), {
          ...values,
          createdAt: serverTimestamp(),
          createdBy: Auth.currentUser.uid,
        });
      } else {
        // If we don't have a checklist, we're creating a new one
        await setDoc(
          doc(
            Firestore,
            "Organizations",
            location.organizationId,
            "locationChecklist",
            location.id
          ),
          {
            sections: {
              [nanoid()]: {
                ...values,
                createdAt: serverTimestamp(),
                createdBy: Auth.currentUser.uid,
              },
            },
            locationId: location.id,
          }
        );
      }
      handleClose();
    } catch (error) {
      recordError(error);
    } finally {
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
      <Form<FormType>
        form={form}
        onFinish={onFinish}
        disabled={isSubmitting}
        initialValues={{
          name: section?.section?.name,
          description: section?.section?.description,
          tag: section?.section?.tag,
        }}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item
          name="name"
          required
          label={t("Name")}
          rules={[
            {
              whitespace: true,
              message: t("Cannot be empty"),
            },
          ]}
        >
          <Input maxLength={80} showCount />
        </Form.Item>

        <Form.Item
          name="tag"
          label={t("Tag")}
          rules={[
            {
              whitespace: true,
              message: t("Cannot be empty"),
            },
          ]}
          normalize={(value: string) => capitalize(value)}
        >
          <Input
            maxLength={30}
            showCount
            placeholder={"E.g. 'Opening', 'Closing', etc."}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label={t("Description")}
          rules={[
            {
              whitespace: true,
              message: t("Cannot be empty"),
            },
          ]}
        >
          <Input.TextArea maxLength={250} showCount rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default ManageSectionDialog;
