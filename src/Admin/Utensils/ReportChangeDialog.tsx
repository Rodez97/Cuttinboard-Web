import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  MinusOutlined,
  SaveFilled,
} from "@ant-design/icons";
import { Colors, useUtensils } from "@rodez97/cuttinboard-library";
import { IUtensil } from "@rodez97/types-helpers";
import { Button, Drawer, Form, Input, InputNumber, Typography } from "antd/es";
import React from "react";
import { useTranslation } from "react-i18next";
import { logAnalyticsEvent } from "utils/analyticsHelpers";

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
    await addUtensilChange(utensil, changeQty, reason);
    handleClose();

    logAnalyticsEvent("utensil_report_change");
  };

  const handleClose = () => {
    onClose();
    form.resetFields();
  };

  return (
    <Drawer
      open={open}
      maskClosable={false}
      title={
        <div>
          <Typography.Text strong>{utensil.name}</Typography.Text>
          <Typography.Text type="secondary">
            {" "}
            - {t("Report change")}
          </Typography.Text>
        </div>
      }
      onClose={handleClose}
      extra={
        <Button
          key="ok"
          onClick={form.submit}
          type="primary"
          icon={<SaveFilled />}
        >
          {t("Save")}
        </Button>
      }
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
        <Form.Item label={t("Change Quantity")} shouldUpdate name="changeQty">
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
    </Drawer>
  );
}

export default ReportChangeDialog;
