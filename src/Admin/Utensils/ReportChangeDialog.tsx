import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  MinusOutlined,
  SaveFilled,
} from "@ant-design/icons";
import { Utensil } from "@cuttinboard-solutions/cuttinboard-library/utensils";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Button, Form, Input, InputNumber, Modal } from "antd";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";

interface ReportChangeDialogProps {
  open: boolean;
  onClose: () => void;
  utensil: Utensil;
}

function ReportChangeDialog({
  utensil,
  open,
  onClose,
}: ReportChangeDialogProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const saveChanges = async ({
    changeQty,
    reason,
  }: {
    changeQty: number;
    reason?: string;
  }) => {
    if (changeQty === 0) {
      return;
    }

    setSubmitting(true);
    try {
      await utensil.addChange(changeQty, reason);
    } catch (error) {
      recordError(error);
    }
    setSubmitting(false);
    handleClose();
  };

  const handleClose = () => {
    onClose();
    form.resetFields();
  };

  return (
    <Modal
      open={open}
      confirmLoading={submitting}
      maskClosable={false}
      title={t("Report change")}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose} disabled={submitting}>
          {t("Cancel")}
        </Button>,
        <Button
          key="ok"
          onClick={form.submit}
          type="primary"
          icon={<SaveFilled />}
          loading={submitting}
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
        disabled={submitting}
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
