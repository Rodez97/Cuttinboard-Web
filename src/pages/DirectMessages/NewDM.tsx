/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Modal, ModalProps } from "antd";
import { useState } from "react";
import { useParams } from "react-router-dom";
import NewDMByEmployee from "./NewDMByEmployee";
import NewDMByEmail from "./NewDMByEmail";
import { useTranslation } from "react-i18next";

function NewDM({ onClose, ...props }: ModalProps & { onClose: () => void }) {
  const { t } = useTranslation();
  const { locationId } = useParams();
  const [loading, setLoading] = useState(false);

  return (
    <Modal
      {...props}
      title={t("Start a Chat")}
      footer={null}
      confirmLoading={loading}
    >
      <NewDMByEmail onCreatingChange={setLoading} onClose={onClose} />

      {locationId && (
        <NewDMByEmployee onCreatingChange={setLoading} onClose={onClose} />
      )}
    </Modal>
  );
}

export default NewDM;
