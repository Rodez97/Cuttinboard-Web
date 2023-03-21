/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Alert, Button, Modal, Space } from "antd";
import axios from "axios";
import { logEvent } from "firebase/analytics";
import { useSendEmailVerification } from "react-firebase-hooks/auth";
import { useTranslation } from "react-i18next";
import { useCountdown, useSessionstorageState } from "rooks";
import { recordError } from "../../utils/utils";
import { ANALYTICS, FIREBASE_CONFIG } from "../../firebase";
import * as Cuttinboard from "@cuttinboard-solutions/cuttinboard-library";

const initialCounterTime = new Date();

function VerifyEmailBanner() {
  const { user } = Cuttinboard.useCuttinboard();
  const [sendEmailVerification, sending] = useSendEmailVerification(
    Cuttinboard.AUTH
  );
  const { t } = useTranslation();
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

  const sendVerificationEmail = async () => {
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
      logEvent(ANALYTICS, "email_verification_sent");
    } catch (error) {
      recordError(error);
    }
  };

  const handleContinue = async () => {
    try {
      const idToken = await user.getIdToken(true);
      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_CONFIG.apiKey}`,
        { idToken }
      );
      if (response.status !== 200) {
        alert("Error verifying email");
        return;
      }
      if (response.data?.users?.[0]?.emailVerified) {
        clearSentTime();
        // Report to analytics
        logEvent(ANALYTICS, "email_verified", {
          email: user?.email,
        });
        location.reload();
      }
    } catch (error) {
      recordError(error);
    }
  };

  return (
    <Alert
      message={t(
        "Verify Your Email Address, click the link in the email we sent you."
      )}
      type="info"
      action={
        <Space wrap>
          <Button
            size="small"
            type="dashed"
            onClick={sendVerificationEmail}
            disabled={Boolean(count)}
            loading={sending}
          >
            {count ? `${count}s` : t("Resend Verification Email")}
          </Button>
          <Button size="small" type="primary" onClick={handleContinue}>
            {t("I've Verified My Email")}
          </Button>
        </Space>
      }
      showIcon
      banner
    />
  );
}

export default VerifyEmailBanner;
