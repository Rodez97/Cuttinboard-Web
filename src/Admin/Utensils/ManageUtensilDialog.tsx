import { SaveFilled } from "@ant-design/icons";
import { Firestore } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import {
  FirebaseSignature,
  IUtensil,
  Utensil,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import {
  useCuttinboard,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { Button, Form, Input, InputNumber, Modal } from "antd";
import {
  addDoc,
  collection,
  PartialWithFieldValue,
  serverTimestamp,
} from "firebase/firestore";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";

export interface IManageUtensilDialogRef {
  openNew: () => void;
  openEdit: (utensil: Utensil) => void;
}

const ManageUtensilDialog = forwardRef<IManageUtensilDialogRef, unknown>(
  (_props, ref) => {
    const [form] = Form.useForm<IUtensil>();
    const [saving, setSaving] = useState(false);
    const { user } = useCuttinboard();
    const { location } = useLocation();
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [utensil, setUtensil] = useState<Utensil>(null);

    useImperativeHandle(ref, () => ({
      openNew,
      openEdit,
    }));

    const openNew = () => {
      setTitle("Add Utensil");
      setOpen(true);
    };

    const openEdit = (utensilToEdit: Utensil) => {
      setTitle("Edit Utensil");
      form.setFieldsValue(utensilToEdit);
      setUtensil(utensilToEdit);
      setOpen(true);
    };

    const handleClose = () => {
      form.resetFields();
      setOpen(false);
      setUtensil(null);
    };

    const onFinish = async (values: Partial<IUtensil>) => {
      setSaving(true);
      try {
        if (utensil) {
          await utensil.update(values);
        } else {
          const newAppObject: PartialWithFieldValue<
            IUtensil & FirebaseSignature
          > = {
            ...values,
            createdAt: serverTimestamp(),
            createdBy: user.uid,
            locationId: location.id,
          };
          const dbRef = collection(
            Firestore,
            "Organizations",
            location.organizationId,
            "utensils"
          );
          await addDoc(dbRef, newAppObject);
        }
      } catch (error) {
        recordError(error);
      }
      setSaving(false);
      handleClose();
    };

    return (
      <Modal
        visible={open}
        title={t(title)}
        onCancel={handleClose}
        footer={[
          <Button disabled={saving} onClick={handleClose} key="cancel">
            {t("Cancel")}
          </Button>,
          <Button
            loading={saving}
            type="primary"
            onClick={form.submit}
            key="submit"
            icon={<SaveFilled />}
          >
            {t("Save")}
          </Button>,
        ]}
      >
        <Form
          form={form}
          onFinish={onFinish}
          size="small"
          layout="vertical"
          disabled={saving}
          autoComplete="off"
        >
          <Form.Item
            name="name"
            label={t("Name")}
            required
            rules={[{ required: true, message: "" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label={t("Description")}
            rules={[{ max: 250, message: "" }]}
          >
            <Input showCount max={250} />
          </Form.Item>
          <Form.Item
            required
            name="optimalQuantity"
            label={t("Optimal Quantity")}
            rules={[
              { type: "number", message: "" },
              { required: true, message: t("Optimal quantity is required") },
            ]}
          >
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item
            required
            name="currentQuantity"
            label={t("Current Quantity")}
            rules={[
              { type: "number", message: "" },
              { required: true, message: t("Current quantity is required") },
            ]}
          >
            <InputNumber min={0} />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
);

export default ManageUtensilDialog;
