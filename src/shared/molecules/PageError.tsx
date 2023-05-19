/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Button, Result } from "antd/es";
import { FirebaseError } from "firebase/app";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { recordError } from "../../utils/utils";

function ErrorPage({ error }: { error: FirebaseError | Error }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    recordError(error);
  }, [error]);

  return (
    <Result
      css={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        flexDirection: "column",
      }}
      status="error"
      title={t("Oops!, something went wrong.")}
      subTitle={t(error.message)}
      extra={
        <Button type="primary" onClick={() => navigate(-1)}>
          {t("Go back")}
        </Button>
      }
    />
  );
}

export default ErrorPage;
