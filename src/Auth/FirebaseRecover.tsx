/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSendPasswordResetEmail } from "react-firebase-hooks/auth";
import { useCountdown, useSessionstorageState } from "rooks";
import { Alert, Button, Form, Input, message, Typography } from "antd/es";
import { AUTH, Colors } from "@rodez97/cuttinboard-library";
import { recordError } from "../utils/utils";
import { logAnalyticsEvent } from "utils/analyticsHelpers";

const initialCounterTime = new Date();

function FirebaseRecover() {
  const [sendPasswordResetEmail, sending, error] =
    useSendPasswordResetEmail(AUTH);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [sentTime, setSentTime, clearSentTime] = useSessionstorageState(
    "recover-pass-email-sent-time",
    ""
  );
  const count = useCountdown(
    sentTime ? new Date(sentTime) : initialCounterTime,
    {
      interval: 1000,
      onEnd: () => clearSentTime(),
    }
  );

  const onFinish = async ({ email }: { email: string }) => {
    try {
      setSentTime(new Date(Date.now() + 60_000).toString());
      await sendPasswordResetEmail(email);
      message.success(
        t("Email sent, if you don't see it check your spam folder")
      );
      // Report to analytics
      logAnalyticsEvent("forgot_password");
    } catch (error) {
      recordError(error);
    }
  };

  return (
    <div
      css={{
        width: 300,
      }}
    >
      <Typography.Title level={4} css={{ marginBottom: "20px !important" }}>
        {t("Recover your password")}
      </Typography.Title>
      <Form disabled={Boolean(count) || sending} onFinish={onFinish}>
        <Form.Item
          required
          name="email"
          rules={[
            {
              required: true,
              message: "",
            },
            { type: "email", message: t("Must be a valid email") },
          ]}
        >
          <Input type="email" placeholder={t("Email")} maxLength={255} />
        </Form.Item>
        <Form.Item css={{ display: "flex", justifyContent: "center" }}>
          <Typography.Link
            onClick={() => navigate(-1)}
            css={{
              color: Colors.MainBlue,
              float: "right",
            }}
          >
            {t("Back to Login")}
          </Typography.Link>
        </Form.Item>

        <Form.Item>
          <Button
            block
            htmlType="submit"
            loading={Boolean(count) || sending}
            type="primary"
          >
            {count ? count : t("Recover")}
          </Button>
        </Form.Item>

        <Form.Item css={{ display: "flex", justifyContent: "center" }}>
          <Typography.Link
            onClick={() => navigate("/register")}
            css={{
              color: Colors.MainBlue,
            }}
            strong
          >
            {t("Don't have an account?")}
          </Typography.Link>
        </Form.Item>
      </Form>
      {error && (
        <Alert
          message="Error"
          description={t(error.message)}
          type="error"
          showIcon
        />
      )}
    </div>
  );
}

export default FirebaseRecover;
