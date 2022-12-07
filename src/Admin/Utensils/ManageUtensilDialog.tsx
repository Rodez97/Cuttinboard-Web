/** @jsx jsx */
import { jsx } from "@emotion/react";
import { SaveFilled } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Modal } from "antd";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";
import {
  IUtensil,
  Utensil,
} from "@cuttinboard-solutions/cuttinboard-library/utensils";
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library/services";

export interface IManageUtensilDialogRef {
  openNew: () => void;
  openEdit: (utensil: Utensil) => void;
}

const ManageUtensilDialog = forwardRef<IManageUtensilDialogRef, unknown>(
  (_props, ref) => {
    const [form] = Form.useForm<Omit<IUtensil, "percent" | "locationId">>();
    const [saving, setSaving] = useState(false);
    const { location } = useCuttinboardLocation();
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [utensil, setUtensil] = useState<Utensil | null>(null);

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

    const onFinish = async (
      values: Omit<IUtensil, "percent" | "locationId">
    ) => {
      setSaving(true);
      try {
        if (utensil) {
          await utensil.update(values);
        } else {
          await Utensil.NewUtensil({ ...values, locationId: location.id });
        }
      } catch (error) {
        recordError(error);
      }
      setSaving(false);
      handleClose();
    };

    return (
      <Modal
        open={open}
        title={t(title)}
        maskClosable={false}
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
          initialValues={{
            name: "",
            description: "",
            optimalQuantity: 1,
            currentQuantity: 0,
          }}
        >
          <Form.Item
            name="name"
            label={t("Name")}
            required
            rules={[{ required: true, message: "" }]}
          >
            <Input maxLength={80} showCount />
          </Form.Item>

          <div
            css={{
              display: "flex",
              flexDirection: "row",
              gap: 5,
              width: "100%",
            }}
          >
            <Form.Item
              css={{ width: "100%" }}
              required
              name="optimalQuantity"
              label={t("Optimal Quantity")}
              rules={[
                { type: "number", message: "" },
                { required: true, message: t("Optimal quantity is required") },
              ]}
            >
              <InputNumber min={1} css={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              css={{ width: "100%" }}
              required
              name="currentQuantity"
              label={t("Current Quantity")}
              rules={[
                { type: "number", message: "" },
                { required: true, message: t("Current quantity is required") },
              ]}
            >
              <InputNumber min={0} css={{ width: "100%" }} />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label={t("Description")}
            rules={[{ max: 250, message: "" }]}
          >
            <Input.TextArea rows={3} maxLength={250} showCount />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
);

export default ManageUtensilDialog;
