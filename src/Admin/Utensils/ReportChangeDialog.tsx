import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  MinusOutlined,
  SaveFilled,
} from "@ant-design/icons";
import { Utensil } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Button, InputNumber, Modal, Space } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { getAnalytics, logEvent } from "firebase/analytics";
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
  const [changeQty, setChangeQty] = useState(0);
  const [reason, setReason] = useState("");
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);

  const saveChanges = async () => {
    if (changeQty === 0) {
      return;
    }
    setSubmitting(true);
    try {
      await utensil.addChange(changeQty, reason);
      // Report to analytics
      const analytics = getAnalytics();
      logEvent(analytics, "report_change");
    } catch (error) {
      recordError(error);
    }
    setSubmitting(false);
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setChangeQty(0);
    setReason("");
  };

  return (
    <Modal
      visible={open}
      confirmLoading={submitting}
      title={t("Report change")}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose} disabled={submitting}>
          {t("Cancel")}
        </Button>,
        <Button
          key="ok"
          onClick={saveChanges}
          type="primary"
          icon={<SaveFilled />}
          loading={submitting}
        >
          {t("Save")}
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ display: "flex" }}>
        <InputNumber<number>
          placeholder={t("Change Quantity")}
          value={changeQty}
          addonBefore={
            changeQty > 0 ? (
              <ArrowUpOutlined style={{ color: Colors.Success.successMain }} />
            ) : changeQty < 0 ? (
              <ArrowDownOutlined style={{ color: Colors.Error.errorMain }} />
            ) : (
              <MinusOutlined />
            )
          }
          onChange={setChangeQty}
          style={{ display: "inherit" }}
          disabled={submitting}
        />
        <TextArea
          rows={3}
          placeholder={t("Reason")}
          maxLength={250}
          showCount
          onChange={(e) => setReason(e.target.value)}
          disabled={submitting}
        />
      </Space>
    </Modal>
  );
}

export default ReportChangeDialog;
