/** @jsx jsx */
import { jsx } from "@emotion/react";
import { EditFilled, SaveFilled } from "@ant-design/icons";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/models";
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  message,
  Space,
  Typography,
} from "antd";
import { setDoc } from "firebase/firestore";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";

type EmployeeContactData = {
  email: string;
  phoneNumber: string;
  preferredName: string;
  emergencyContactName: string;
  emergencyContactPhoneNumber: string;
  contactComments: string;
};

function EmployeeContactPanel({ employee }: { employee: Employee }) {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cancelEditing = () => {
    setEditing(false);
    form.resetFields();
  };

  const onFinish = async (values: EmployeeContactData) => {
    setIsSubmitting(true);
    const {
      emergencyContactName,
      emergencyContactPhoneNumber,
      preferredName,
      contactComments,
    } = values;
    try {
      await setDoc(
        employee.docRef,
        {
          preferredName,
          contactComments,
          emergencyContact: {
            name: emergencyContactName,
            phoneNumber: emergencyContactPhoneNumber,
          },
        },
        { merge: true }
      );
      message.success(t("Changes saved"));
      setEditing(false);
    } catch (error) {
      recordError(error);
    }
    setIsSubmitting(false);
  };

  return (
    <Card
      title={t("Contact Information")}
      css={{
        minWidth: 300,
        maxWidth: 500,
        margin: "auto",
        marginBottom: 16,
      }}
    >
      <Form<EmployeeContactData>
        layout="vertical"
        form={form}
        initialValues={{
          email: employee.email,
          phoneNumber: employee.phoneNumber,
          preferredName: employee.preferredName,
          emergencyContactName: employee.emergencyContact?.name,
          emergencyContactPhoneNumber: employee.emergencyContact?.phoneNumber,
          contactComments: employee.contactComments,
        }}
        disabled={!editing || isSubmitting}
        onFinish={onFinish}
      >
        <Form.Item label={t("Email")} name="email">
          <Input disabled />
        </Form.Item>
        <Form.Item label={t("Phone Number")} name="phoneNumber">
          <Input disabled />
        </Form.Item>
        <Form.Item label={t("Preferred Name")} name="preferredName">
          <Input maxLength={80} showCount />
        </Form.Item>
        <Divider>
          <Typography.Text type="secondary" style={{ fontSize: "14px" }}>
            {t("Emergency Contact")}
          </Typography.Text>
        </Divider>
        <Form.Item label={t("Name")} name="emergencyContactName">
          <Input maxLength={80} showCount />
        </Form.Item>
        <Form.Item label={t("Phone Number")} name="emergencyContactPhoneNumber">
          <Input maxLength={80} showCount />
        </Form.Item>
        <Divider />
        <Form.Item label={t("Comments")} name="contactComments">
          <Input.TextArea rows={2} maxLength={255} showCount />
        </Form.Item>
      </Form>

      <Space
        style={{
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
  );
}

export default EmployeeContactPanel;
