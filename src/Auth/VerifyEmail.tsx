/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { recordError } from "../utils/utils";
import axios from "axios";
import { useCountdown, useSessionstorageState } from "rooks";
import { useSendEmailVerification } from "react-firebase-hooks/auth";
import { Alert, Button, Modal, Typography } from "antd";
import { getAnalytics, logEvent } from "firebase/analytics";
import mdiEmailSealOutline from "@mdi/svg/svg/email-seal-outline.svg";
import Icon, { SendOutlined } from "@ant-design/icons";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  AUTH,
  FIREBASE_CONFIG,
} from "@cuttinboard-solutions/cuttinboard-library/utils";

const initialCounterTime = new Date();

function VerifyEmail() {
  const { user } = useCuttinboard();
  const [sendEmailVerification, sending, verifyError] =
    useSendEmailVerification(AUTH);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState<Error | null>(null);
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

  const resendVerificationEmail = async () => {
    if (count > 0) {
      return;
    }
    try {
      setSentTime(new Date(Date.now() + 120_000).toString());
      await sendEmailVerification();
      Modal.success({
        title: t("Email sent, if you don't see it check your spam folder"),
        content: t(
          "It can take up to 5 minutes to receive verification email. Be patient!"
        ),
      });
      // Report to analytics
      logEvent(getAnalytics(), "email_verification_sent");
    } catch (error) {
      setError(error);
      recordError(error);
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
        setError(new Error("Error verifying email"));
        return;
      }
      if (response.data?.users?.[0]?.emailVerified) {
        clearSentTime();
        // Report to analytics
        logEvent(getAnalytics(), "email_verified", {
          email: user?.email,
        });
        location.reload();
      }
    } catch (error) {
      setError(error);
      recordError(error);
    }
  };

  return (
    <div
      css={{
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        margin: "auto",
      }}
    >
      <div
        css={{
          width: 300,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <Icon
          component={mdiEmailSealOutline}
          css={{ fontSize: 100, color: "#00000040", margin: "auto" }}
        />
        <Typography.Title level={3} css={{ textAlign: "center" }}>
          {t("You must verify your email")}
        </Typography.Title>
        <Button
          onClick={resendVerificationEmail}
          disabled={Boolean(count)}
          type="dashed"
          block
          loading={sending}
          icon={<SendOutlined />}
        >
          {count ? `${count}s` : t("Send verification email")}
        </Button>
        <Button type="link" onClick={backToDashboard} block disabled={sending}>
          {t("Return to Dashboard")}
        </Button>

        <Button
          onClick={handleContinue}
          type="primary"
          block
          disabled={sending}
        >
          {t("Continue")}
        </Button>

        {error && <Alert message={t(error.message)} type="error" showIcon />}

        {verifyError && (
          <Alert message={t(verifyError.message)} type="error" showIcon />
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
