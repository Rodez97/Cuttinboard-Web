import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  MinusOutlined,
  SaveFilled,
} from "@ant-design/icons";
import {
  Colors,
  useUtensils,
} from "@cuttinboard-solutions/cuttinboard-library";
import { IUtensil } from "@cuttinboard-solutions/types-helpers";
import { Button, Form, Input, InputNumber, Modal } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";

interface ReportChangeDialogProps {
  open: boolean;
  onClose: () => void;
  utensil: IUtensil;
}

function ReportChangeDialog({
  utensil,
  open,
  onClose,
}: ReportChangeDialogProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { addUtensilChange } = useUtensils();

  const saveChanges = ({
    changeQty,
    reason,
  }: {
    changeQty: number;
    reason?: string;
  }) => {
    if (changeQty === 0) {
      return;
    }
    addUtensilChange(utensil, changeQty, reason);
    handleClose();
  };

  const handleClose = () => {
    onClose();
    form.resetFields();
  };

  return (
    <Modal
      open={open}
      maskClosable={false}
      title={t("Report change")}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          {t("Cancel")}
        </Button>,
        <Button
          key="ok"
          onClick={form.submit}
          type="primary"
          icon={<SaveFilled />}
        >
          {t("Save")}
        </Button>,
      ]}
    >
      <Form
        initialValues={{
          changeQty: 0,
          reason: "",
        }}
        layout="vertical"
        form={form}
        onFinish={saveChanges}
      >
        <Form.Item label={t("Change quantity")} shouldUpdate name="changeQty">
          <InputNumber<number>
            controls={true}
            addonBefore={
              <Form.Item shouldUpdate noStyle>
                {({ getFieldValue }) => {
                  const changeQty: number = getFieldValue("changeQty");
                  return changeQty > 0 ? (
                    <ArrowUpOutlined
                      style={{ color: Colors.Success.successMain }}
                    />
                  ) : changeQty < 0 ? (
                    <ArrowDownOutlined
                      style={{ color: Colors.Error.errorMain }}
                    />
                  ) : (
                    <MinusOutlined />
                  );
                }}
              </Form.Item>
            }
            style={{ display: "inherit" }}
            min={-utensil.currentQuantity}
          />
        </Form.Item>

        <Form.Item label={t("Reason")} name="reason">
          <Input.TextArea rows={3} maxLength={250} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ReportChangeDialog;
