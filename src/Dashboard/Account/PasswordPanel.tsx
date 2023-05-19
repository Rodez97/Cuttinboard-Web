/** @jsx jsx */
import { jsx } from "@emotion/react";
import { EditFilled, SaveFilled } from "@ant-design/icons";
import { Alert, Button, Card, Form, Input, message, Space } from "antd/es";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useState } from "react";
import { useUpdatePassword } from "react-firebase-hooks/auth";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";
import {
  AUTH,
  useCuttinboard,
} from "@cuttinboard-solutions/cuttinboard-library";

function PasswordPanel() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const { user } = useCuttinboard();
  const [updatePassword, updating, error] = useUpdatePassword(AUTH);
  const [editing, setEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cancelEditing = () => {
    setEditing(false);
    form.resetFields();
  };

  const onFinish = async (values: {
    password: string;
    newPassword: string;
  }) => {
    if (!user.email) {
      message.error(
        t("You must have an email address to change your password")
      );
      return;
    }

    try {
      const { password, newPassword } = values;
      setIsSubmitting(true);
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(newPassword);
      form.resetFields();
      setEditing(false);
      message.success(t("Changes saved"));
    } catch (error) {
      recordError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Space
      direction="vertical"
      css={{ maxWidth: 500, minWidth: 300, width: "100%", marginBottom: 3 }}
    >
      <Card title={t("Change Password")}>
        <Form
          form={form}
          disabled={!editing || isSubmitting || updating}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            label={t("Current Password")}
            name="password"
            rules={[{ required: true, message: "" }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>

          <Form.Item
            label={t("New Password")}
            name="newPassword"
            rules={[
              { required: true, message: "" },
              { min: 8, message: t("Be at least 8 characters in length") },
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
            <Input.Password autoComplete="new-password" />
          </Form.Item>

          <Form.Item
            label={t("Confirm New Password")}
            name="repeatPassword"
            dependencies={["newPassword"]}
            hasFeedback
            rules={[
              { required: true, message: "" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") !== value) {
                    return Promise.reject(
                      new Error(t("Passwords must be equals"))
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
        </Form>
        <Space
          css={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          {editing && (
            <Button onClick={cancelEditing} disabled={isSubmitting}>
              {t("Cancel")}
            </Button>
          )}
          {editing ? (
            <Button
              icon={<SaveFilled />}
              loading={isSubmitting || updating}
              onClick={form.submit}
              type="primary"
            >
              {t("Save")}
            </Button>
          ) : (
            <Button
              icon={<EditFilled />}
              loading={isSubmitting || updating}
              onClick={() => setEditing(true)}
              type="link"
              disabled={false}
            >
              {t("Edit")}
            </Button>
          )}
        </Space>

        {error && <Alert message={error.message} type="error" showIcon />}
      </Card>
    </Space>
  );
}

export default PasswordPanel;
