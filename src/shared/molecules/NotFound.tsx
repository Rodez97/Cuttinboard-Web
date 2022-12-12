import { Button, Result } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <Result
      status="404"
      title="404"
      subTitle={t("Sorry, the page you visited does not exist.")}
      extra={
        <Button type="primary" onClick={() => navigate(-1)}>
          {t("Go back")}
        </Button>
      }
    />
  );
}

export default NotFound;