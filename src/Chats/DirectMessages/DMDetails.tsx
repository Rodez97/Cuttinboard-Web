/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Alert, Modal, ModalProps, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useDirectMessageChat } from "@cuttinboard-solutions/cuttinboard-library";
import CuttinboardAvatar from "../../shared/atoms/Avatar";

export default (props: ModalProps) => {
  const { t } = useTranslation();
  const { selectedDirectMessage, recipientUser } = useDirectMessageChat();

  if (!selectedDirectMessage || !recipientUser) {
    return null;
  }

  if (recipientUser._id === "deleted") {
    return (
      <Modal {...props} title={t("Details")} footer={null}>
        <Alert message={t("This employee has been removed")} type="warning" />
      </Modal>
    );
  }

  return (
    <Modal {...props} title={t("Details")} footer={null}>
      <div
        css={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "center",
        }}
      >
        <CuttinboardAvatar
          alt={recipientUser.name}
          size={100}
          src={recipientUser.avatar}
        />
        <Typography.Text type="secondary" css={{ fontSize: 16 }}>
          {recipientUser.name}
        </Typography.Text>
      </div>
    </Modal>
  );
};
