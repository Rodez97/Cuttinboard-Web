import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  MinusOutlined,
  SaveFilled,
} from "@ant-design/icons";
import { Utensil } from "@cuttinboard-solutions/cuttinboard-library/models";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Button, InputNumber, Modal, Space } from "antd";
import TextArea from "antd/lib/input/TextArea";
import {
  arrayRemove,
  arrayUnion,
  getFirestore,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
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
  const Firestore = getFirestore();
  const [changeQty, setChangeQty] = useState(0);
  const [reason, setReason] = useState("");
  const { user } = useCuttinboard();
  const { t } = useTranslation();

  const saveChanges = async () => {
    if (changeQty === 0) {
      handleClose();
      return;
    }
    const changesLength = utensil?.changes?.length ?? 0;
    try {
      const batch = writeBatch(Firestore);
      if (changesLength >= 5) {
        batch.set(
          utensil.docRef,
          { changes: arrayRemove(utensil?.changes[0]) },
          { merge: true }
        );
      }
      const changeObject = {
        quantity: changeQty,
        date: Timestamp.now(),
        userId: user.uid,
        reason,
      };
      const changeRecord = {
        currentQuantity: utensil.currentQuantity + changeQty,
        changes: arrayUnion(changeObject),
      };
      batch.set(utensil.docRef, changeRecord, { merge: true });
      await batch.commit();
    } catch (error) {
      recordError(error);
    }
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
      title={t("Report change")}
      onCancel={handleClose}
      footer={[
        <Button onClick={handleClose}>{t("Cancel")}</Button>,
        <Button onClick={saveChanges} type="primary" icon={<SaveFilled />}>
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
        />
        <TextArea
          rows={3}
          placeholder={t("Reason")}
          maxLength={250}
          showCount
          onChange={(e) => setReason(e.target.value)}
        />
      </Space>
    </Modal>
  );
}

export default ReportChangeDialog;
