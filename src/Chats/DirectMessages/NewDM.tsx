/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Modal, ModalProps } from "antd";
import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import NewDMByEmployee from "./NewDMByEmployee";
import NewDMByEmail, { NewDMByEmailRef } from "./NewDMByEmail";
import { useTranslation } from "react-i18next";

export default ({
  onClose,
  ...props
}: ModalProps & { onClose: () => void }) => {
  const { t } = useTranslation();
  const { locationId } = useParams();
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
      title={t("Start a Chat")}
      footer={null}
      confirmLoading={loading}
    >
      <NewDMByEmail
        onCreatingChange={setLoading}
        onClose={handleClose}
        ref={newDMByEmailRef}
      />

      {locationId && (
        <NewDMByEmployee onCreatingChange={setLoading} onClose={handleClose} />
      )}
    </Modal>
  );
};
