/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getAnalytics, logEvent } from "firebase/analytics";
import { recordError } from "../utils/utils";
import { Alert, Button, Checkbox, Form, Input, Typography } from "antd";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { useRegisterUser } from "@cuttinboard-solutions/cuttinboard-library/services";

//= ==========================|| FIREBASE - REGISTER ||===========================//

const FirebaseRegister = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { registerUser, submitting, error } = useRegisterUser();

  const onFinish = async ({
    name,
    lastName,
    email,
    password,
  }: {
    name: string;
    lastName: string;
    email: string;
    password: string;
    acceptTerms: boolean;
  }) => {
    try {
      await registerUser({
        email,
        name,
        lastName,
        password,
      });
      logEvent(getAnalytics(), "sign_up", {
        method: "Email-Password",
        email,
      });
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
        {t("Sign up")}
      </Typography.Title>
      <Form
        disabled={submitting}
        onFinish={onFinish}
        initialValues={{ acceptTerms: false }}
      >
        <Form.Item
          required
          name="name"
          rules={[
            {
              required: true,
              message: "",
            },
          ]}
        >
          <Input placeholder={t("First Name")} maxLength={255} />
        </Form.Item>
        <Form.Item
          required
          name="lastName"
          rules={[
            {
              required: true,
              message: "",
            },
          ]}
        >
          <Input placeholder={t("Last Name")} maxLength={255} />
        </Form.Item>
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
            {
              pattern: /[0-9]/,
              message: t("Have at least one numerical character (e.g. 0-9)"),
            },
            {
              pattern: /[a-z]/,
              message: t(
                "Contain both upper and lowercase alphabetic characters (e.g. A-Z, a-z)"
              ),
            },
            {
              pattern: /[A-Z]/,
              message: t(
                "Contain both upper and lowercase alphabetic characters (e.g. A-Z, a-z)"
              ),
            },
          ]}
        >
          <Input.Password placeholder={t("Password")} maxLength={255} />
        </Form.Item>
        <Form.Item
          required
          valuePropName="checked"
          name="acceptTerms"
          rules={[
            {
              validator(_, value) {
                if (value === false) {
                  return Promise.reject(
                    new Error(t("You must accept the Terms & Conditions"))
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Checkbox>
            <Typography.Link
              href="https://www.cuttinboard.com/legal"
              target="_blank"
              css={{
                color: Colors.MainBlue,
              }}
            >
              {t("Agree with Privacy Policy & Terms of Service")}
            </Typography.Link>
          </Checkbox>
        </Form.Item>

        <Form.Item>
          <Button block htmlType="submit" loading={submitting} type="primary">
            {t("Sign up")}
          </Button>
        </Form.Item>

        <Form.Item css={{ display: "flex", justifyContent: "center" }}>
          <Typography.Link
            onClick={() => navigate("/login")}
            css={{
              color: Colors.MainBlue,
            }}
            strong
          >
            {t("Have an account?")}
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
};

export default FirebaseRegister;
