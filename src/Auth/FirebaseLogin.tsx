/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate } from "react-router-dom";
import { logEvent } from "firebase/analytics";
// third party
import { recordError } from "../utils/utils";
import { Alert, Button, Form, Input, Typography } from "antd";
import {
  AUTH,
  Colors,
  useCuttinboardRaw,
} from "@cuttinboard-solutions/cuttinboard-library";
import { ANALYTICS } from "firebase";
import { AuthError, signInWithEmailAndPassword } from "firebase/auth";

//= ===========================|| FIREBASE - LOGIN ||============================//

const FirebaseLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<AuthError>();
  const { user } = useCuttinboardRaw();

  const onFinish = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(AUTH, email, password);
      logEvent(ANALYTICS, "login", {
        method: "Email-Password",
        email,
      });
      navigate("/dashboard");
    } catch (error) {
      setError(error);
      recordError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div
      css={{
        width: 300,
      }}
    >
      <Typography.Title level={4} css={{ marginBottom: "20px !important" }}>
        {t("Hi, Welcome Back")}
      </Typography.Title>
      <Form disabled={isSubmitting} onFinish={onFinish}>
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
        <Form.Item
          required
          name="password"
          rules={[
            {
              required: true,
              message: "",
            },
          ]}
        >
          <Input.Password placeholder={t("Password")} maxLength={255} />
        </Form.Item>
        <Form.Item>
          <Typography.Link
            onClick={() => navigate("/forgot-password")}
            css={{
              color: Colors.MainBlue,
              float: "right",
            }}
          >
            {t("Forgot Password?")}
          </Typography.Link>
        </Form.Item>

        <Form.Item>
          <Button block htmlType="submit" loading={isSubmitting} type="primary">
            {t("Sign In")}
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
          description={t(error.code)}
          type="error"
          showIcon
          closable
        />
      )}
    </div>
  );
};

export default FirebaseLogin;
