/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { logEvent } from "firebase/analytics";
import { recordError, TrimRule } from "../utils/utils";
import { Alert, Button, Checkbox, Form, Input, Typography } from "antd";
import {
  Colors,
  useRegister,
} from "@cuttinboard-solutions/cuttinboard-library";
import { useMemo } from "react";
import { AuthError } from "firebase/auth";
import useSignUpLocalTracker from "../hooks/useSignUpLocalTracker";
import { ANALYTICS } from "firebase";

//= ==========================|| FIREBASE - REGISTER ||===========================//

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const authErrorTypeguard = (error: any): error is AuthError => {
  return error.code !== undefined;
};

const FirebaseRegister = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { registerUser, isSubmitting, error } = useRegister();
  const [, setNewUser] = useSignUpLocalTracker();

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
      // Store the newly created user in the local storage to be used in the first login event to show the onboarding flow
      setNewUser(email);

      logEvent(ANALYTICS, "sign_up", {
        method: "Email-Password",
        email,
      });

      navigate("/dashboard", { replace: true });
    } catch (error) {
      recordError(error);
    }
  };

  const errorMessage = useMemo(() => {
    if (error && authErrorTypeguard(error)) {
      return t(error.code);
    } else if (error) {
      return t(error.message);
    }
  }, [error, t]);

  return (
    <div
      css={{
        width: 300,
      }}
    >
      <Typography.Title level={4} css={{ marginBottom: "20px !important" }}>
        {t("Sign Up")}
      </Typography.Title>
      <Form
        disabled={isSubmitting}
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
            {
              max: 20,
              message: t("Name must be 20 characters or less"),
            },
            {
              whitespace: true,
              message: t("Name cannot be empty"),
            },
            TrimRule,
          ]}
        >
          <Input placeholder={t("First Name")} maxLength={20} showCount />
        </Form.Item>
        <Form.Item
          required
          name="lastName"
          rules={[
            {
              required: true,
              message: "",
            },
            {
              max: 20,
              message: t("Last Name must be 20 characters or less"),
            },
            {
              whitespace: true,
              message: t("Name cannot be empty"),
            },
            {
              validator: async (_, value) => {
                // Check if value don't have tailing or leading spaces
                if (value !== value.trim()) {
                  return Promise.reject(
                    new Error(t("Name cannot have leading or trailing spaces"))
                  );
                }
              },
            },
          ]}
        >
          <Input placeholder={t("Last Name")} maxLength={20} showCount />
        </Form.Item>
        <Form.Item
          required
          name="email"
          normalize={(value: string) => value?.toLowerCase()}
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
            // min 8 characters
            {
              min: 8,
              message: t("Have at least 8 characters"),
            },
          ]}
        >
          <Input.Password
            placeholder={t("Password")}
            maxLength={255}
            showCount
          />
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
          <Button block htmlType="submit" loading={isSubmitting} type="primary">
            {t("Sign Up")}
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
      {errorMessage && (
        <Alert
          message="Error"
          description={errorMessage}
          type="error"
          showIcon
        />
      )}
    </div>
  );
};

export default FirebaseRegister;
