/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Spin } from "antd";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GrayPageHeader } from "components/PageHeaders";
import NewDMByEmployee from "./NewDMByEmployee";
import NewDMByEmail from "./NewDMByEmail";
import { useTranslation } from "react-i18next";

function NewDM() {
  const { t } = useTranslation();
  const { locationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  return (
    <Spin spinning={loading}>
      <GrayPageHeader title={t("Start a Chat")} onBack={() => navigate(-1)} />
      <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
        <div
          css={{ minWidth: 270, maxWidth: 500, margin: "auto", width: "100%" }}
        >
          <NewDMByEmail onCreatingChange={setLoading} />

          {locationId && <NewDMByEmployee onCreatingChange={setLoading} />}
        </div>
      </div>
    </Spin>
  );
}

export default NewDM;
