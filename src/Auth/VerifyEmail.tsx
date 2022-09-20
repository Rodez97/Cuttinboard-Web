/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  Auth,
  FIREBASE_CONFIG,
  useCuttinboard,
} from "@cuttinboard/cuttinboard-library";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { recordError } from "../utils/utils";
import axios from "axios";
import { useCountdown, useSessionstorageState } from "rooks";
import { useSendEmailVerification } from "react-firebase-hooks/auth";
import PageError from "../components/PageError";
import PageLoading from "../components/PageLoading";
import { Alert, Button, Modal, Typography } from "antd";

const initialCounterTime = new Date();

function VerifyEmail() {
  const { user } = useCuttinboard();
  const [sendEmailVerification, sending, error] =
    useSendEmailVerification(Auth);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [txtMessage, setMessage] = useState("");
  const [sentTime, setSentTime, clearSentTime] = useSessionstorageState(
    "verification-email-sent-time",
    ""
  );
  const count = useCountdown(
    sentTime ? new Date(sentTime) : initialCounterTime,
    {
      interval: 1000,
      onEnd: () => clearSentTime(),
    }
  );

  useEffect(() => {
    if (!sentTime) {
      resendVerificationEmail();
    }
  }, []);

  const resendVerificationEmail = async () => {
    try {
      setSentTime(new Date(Date.now() + 120_000).toString());
      await sendEmailVerification();
      Modal.success({
        title: t("Email sent, if you don't see it check your spam folder"),
        content: t(
          "It can take up to 5 minutes to receive verification email. Be patient!"
        ),
      });
    } catch (error) {
      recordError(error);
      setMessage(error?.code);
    }
  };

  const backToDashboard = () => navigate("/dashboard");

  const handleContinue = async () => {
    try {
      const idToken = await user.getIdToken(true);
      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_CONFIG.apiKey}`,
        { idToken }
      );
      if (response.status !== 200) {
        throw new Error("Request error");
      }
      if (response.data?.users?.[0]?.emailVerified) {
        clearSentTime();
        location.reload();
      }
    } catch (error) {
      recordError(error);
    }
  };

  if (error) {
    return <PageError error={error} />;
  }
  if (sending) {
    return <PageLoading />;
  }

  return (
    <div
      css={{
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        css={{
          width: 300,
          gap: "8px",
        }}
      >
        <Typography.Title level={4} css={{ marginBottom: "20px !important" }}>
          {t("You must verify your email")}
        </Typography.Title>
        <Button
          onClick={resendVerificationEmail}
          disabled={Boolean(count)}
          type="dashed"
          block
        >
          {count ? `${count}s` : t("Resend verification email")}
        </Button>
        <Button type="link" onClick={backToDashboard} block>
          {t("Return to Dashboard")}
        </Button>
        {txtMessage && (
          <Alert message={t(txtMessage)} type="success" showIcon />
        )}
        <Button onClick={handleContinue} type="primary" block>
          {t("Continue")}
        </Button>
      </div>
    </div>
  );
}

export default VerifyEmail;
