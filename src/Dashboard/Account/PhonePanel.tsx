/** @jsx jsx */
import { jsx } from "@emotion/react";
import { EditFilled, SaveFilled } from "@ant-design/icons";
import {
  Auth,
  Firestore,
} from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Button, Card, Form, Input, InputNumber, message, Space } from "antd";
import {
  PhoneAuthProvider,
  RecaptchaVerifier,
  updatePhoneNumber,
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";

function PhonePanel() {
  const [form] = Form.useForm();
  const { user } = useCuttinboard();
  const [editing, setEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  /**
   * Cambiar el número de teléfono del usuario
   * - **Nota:** *Solo en WEB*
   * @param newPhoneNumber Nuevo número de teléfono
   */
  const changePhoneNumber = async (newPhoneNumber: string) => {
    const userRef = doc(Firestore, "Users", user.uid);
    try {
      const recaptcha = document.createElement("div");
      recaptcha.setAttribute("id", "recaptcha-container");
      document.body.appendChild(recaptcha);
      // 'recaptcha-container' is the ID of an element in the DOM.
      const applicationVerifier = new RecaptchaVerifier(
        recaptcha,
        { size: "invisible" },
        Auth
      );
      const provider = new PhoneAuthProvider(Auth);
      const verificationId = await provider.verifyPhoneNumber(
        newPhoneNumber,
        applicationVerifier
      );
      // Obtain the verificationCode from the user.
      const verificationCode = window.prompt(
        t("Please enter the verification code that was sent to your phone.")
      );

      const phoneCredential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      await updatePhoneNumber(user, phoneCredential);
      await updateDoc(userRef, { phoneNumber: newPhoneNumber });
      document.body.removeChild(recaptcha);
    } catch (error) {
      recordError(error);
    }
  };

  const cancelEditing = () => {
    setEditing(false);
    form.resetFields();
  };

  const onFinish = async (values) => {
    const { newPhoneNumber } = values;
    setIsSubmitting(true);
    const finalNewPhone = `+${newPhoneNumber}`;
    try {
      await changePhoneNumber(finalNewPhone);
      setEditing(false);
      form.resetFields();
      message.success(t("Changes saved"));
    } catch (error) {
      recordError(error);
    }
    setIsSubmitting(false);
  };

  return (
    <Space
      direction="vertical"
      css={{ maxWidth: 500, minWidth: 300, width: "100%", marginBottom: 3 }}
    >
      <Card title={t("Phone Number")}>
        <Form
          form={form}
          disabled={!editing || isSubmitting}
          initialValues={{ phoneNumber: user?.phoneNumber }}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item label={t("Current Phone Number")} name="phoneNumber">
            <Input disabled />
          </Form.Item>
          <Form.Item
            label={t("New Phone Number")}
            name="newPhoneNumber"
            dependencies={["phoneNumber"]}
            hasFeedback
            help={t("Include country code first (+1XXXXXXXXXX)")}
            rules={[
              { required: true, message: "" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const finalNewPhone = `+${value}`;
                  if (
                    !value ||
                    getFieldValue("phoneNumber") === finalNewPhone
                  ) {
                    return Promise.reject(
                      new Error(
                        t(
                          "New phone number can't be equal to current phone number"
                        )
                      )
                    );
                  }
                  return Promise.resolve();
                },
              }),
              { type: "number", message: "" },
            ]}
          >
            <InputNumber prefix="+" css={{ width: "100%" }} />
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
              loading={isSubmitting}
              onClick={form.submit}
              type="primary"
            >
              {t("Save")}
            </Button>
          ) : (
            <Button
              icon={<EditFilled />}
              loading={isSubmitting}
              onClick={() => setEditing(true)}
              type="link"
              disabled={false}
            >
              {t("Edit")}
            </Button>
          )}
        </Space>
      </Card>
    </Space>
  );
}

export default PhonePanel;
