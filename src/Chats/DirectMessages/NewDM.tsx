/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Modal, ModalProps, Typography } from "antd";
import { useRef, useState } from "react";
import NewDMByEmployee from "./NewDMByEmployee";
import NewDMByEmail, { NewDMByEmailRef } from "./NewDMByEmail";
import { useTranslation } from "react-i18next";

export default ({
  onClose,
  locationId,
  ...props
}: ModalProps & { onClose: () => void; locationId?: string }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const newDMByEmailRef = useRef<NewDMByEmailRef>(null);

  const handleClose = () => {
    newDMByEmailRef.current?.reset();
    onClose();
  };

  return (
    <Modal
      {...props}
      onCancel={handleClose}
      title={t("Start a Direct Message")}
      footer={null}
      confirmLoading={loading}
    >
      <NewDMByEmail
        onCreatingChange={setLoading}
        onClose={handleClose}
        ref={newDMByEmailRef}
      />

      {locationId ? (
        <NewDMByEmployee onCreatingChange={setLoading} onClose={handleClose} />
      ) : (
        <Typography.Text
          type="secondary"
          css={{
            textAlign: "center",
            width: "100%",
            display: "block",
          }}
        >
          {t(
            "Don't know the email? Log into a location to message your coworkers directly"
          )}
        </Typography.Text>
      )}
    </Modal>
  );
};
