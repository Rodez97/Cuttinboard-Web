/** @jsx jsx */
import { jsx } from "@emotion/react";
import { SaveFilled } from "@ant-design/icons";
import { Button, Drawer, Form, Input, InputNumber } from "antd/es";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FIRESTORE,
  useCuttinboardLocation,
  useUtensils,
} from "@rodez97/cuttinboard-library";
import { nanoid } from "nanoid";
import { Timestamp, doc } from "firebase/firestore";
import { IUtensil } from "@rodez97/types-helpers";
import { logAnalyticsEvent } from "utils/analyticsHelpers";

interface IManageUtensilDialogRef {
  openNew: () => void;
  openEdit: (utensil: IUtensil) => void;
}

const ManageUtensilDialog = forwardRef<IManageUtensilDialogRef, unknown>(
  (_, ref) => {
    const { location } = useCuttinboardLocation();
    const [form] = Form.useForm<Omit<IUtensil, "percent">>();
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [utensil, setUtensil] = useState<IUtensil | null>(null);
    const { updateUtensil, createUtensil } = useUtensils();

    useImperativeHandle(ref, () => ({
      openNew,
      openEdit,
    }));

    const openNew = () => {
      setTitle("Add Utensil");
      setOpen(true);
    };

    const openEdit = (utensilToEdit: IUtensil) => {
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

    const onFinish = (values: Omit<IUtensil, "percent">) => {
      if (utensil) {
        updateUtensil(utensil, values);
      } else {
        const newId = nanoid();
        const reference = doc(
          FIRESTORE,
          "Locations",
          location.id,
          "utensils",
          newId
        );
        const newUtensil: Omit<IUtensil, "percent"> = {
          ...values,
          id: newId,
          refPath: reference.path,
          createdAt: Timestamp.now().toMillis(),
        };
        createUtensil(newUtensil);

        logAnalyticsEvent("utensil_created", {
          name: newUtensil.name,
          optimalQuantity: newUtensil.optimalQuantity,
        });
      }
      handleClose();
    };

    return (
      <Drawer
        open={open}
        title={t(title)}
        maskClosable={false}
        onClose={handleClose}
        extra={
          <Button
            type="primary"
            onClick={form.submit}
            key="submit"
            icon={<SaveFilled />}
          >
            {t("Save")}
          </Button>
        }
      >
        <Form
          form={form}
          onFinish={onFinish}
          size="small"
          layout="vertical"
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
      </Drawer>
    );
  }
);

export const useManageUtensilDialog = () => {
  const ref = useRef<IManageUtensilDialogRef>(null);

  const openNew = () => {
    ref.current?.openNew();
  };

  const openEdit = (utensil: IUtensil) => {
    ref.current?.openEdit(utensil);
  };

  return {
    openNew,
    openEdit,
    ManageUtensilDialog: <ManageUtensilDialog ref={ref} />,
  };
};

export default ManageUtensilDialog;
