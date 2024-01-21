/** @jsx jsx */
import { css, jsx } from "@emotion/react";
import { Button, Modal, Space } from "antd/es";
import axios from "axios";
import { useSendEmailVerification } from "react-firebase-hooks/auth";
import { useTranslation } from "react-i18next";
import { useCountdown, useSessionstorageState } from "rooks";
import { recordError } from "../../utils/utils";
import { FIREBASE_CONFIG } from "../../firebase";
import { AUTH, useCuttinboard } from "@rodez97/cuttinboard-library";
import { logAnalyticsEvent } from "../../utils/analyticsHelpers";

const initialCounterTime = new Date();

function VerifyEmailBanner() {
  const { user } = useCuttinboard();
  const [sendEmailVerification, sending] = useSendEmailVerification(AUTH);
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
      logAnalyticsEvent("email_verification_sent");
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
        logAnalyticsEvent("email_verified", {
          email: user?.email,
        });
        location.reload();
      }
    } catch (error) {
      recordError(error);
    }
  };

  return (
    <div
      css={css`
        background-color: #e6f4ff;
        display: flex;
        flex-direction: row;
        margin-bottom: 0;
        border: 0 !important;
        border-radius: 0 !important;
        padding: 8px 12px;
        margin: 0;
        justify-content: space-between;
        @media (max-width: 575px) {
          flex-direction: column;
        }
      `}
    >
      <span
        css={css`
          @media (max-width: 575px) {
            text-align: center;
            margin-bottom: 8px;
          }
        `}
      >
        {t(
          "Verify Your Email Address, click the link in the email we sent you"
        )}
      </span>
      <Space
        wrap
        css={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button
          size="small"
          type="dashed"
          onClick={sendVerificationEmail}
          disabled={Boolean(count)}
          loading={sending}
        >
          {count ? `${count}s` : t("Resend Verification Email")}
        </Button>
        <Button size="small" type="primary" onClick={handleContinue} block>
          {t("I've Verified My Email")}
        </Button>
      </Space>
    </div>
  );
}

export default VerifyEmailBanner;
