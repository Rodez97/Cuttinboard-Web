/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Card, Divider, Form, Input, Typography } from "antd";
import { useTranslation } from "react-i18next";

type EmployeeContactData = {
  email: string;
  phoneNumber: string;
  preferredName: string;
  emergencyContactName: string;
  emergencyContactPhoneNumber: string;
  contactComments: string;
};

function EmployeeContactPanel({ employee }: { employee: Employee }) {
  const { t } = useTranslation();

  return (
    <Card
      title={t("Contact Information")}
      css={{
        minWidth: 300,
        maxWidth: 500,
        margin: "auto",
        marginTop: 16,
      }}
    >
      <Form<EmployeeContactData> layout="vertical" disabled autoComplete="off">
        <Form.Item label={t("Email")} name="email">
          <Input defaultValue={employee.email} />
        </Form.Item>
        <Form.Item label={t("Phone Number")} name="phoneNumber">
          <Input defaultValue={employee.phoneNumber} />
        </Form.Item>
        <Form.Item label={t("Preferred Name")} name="preferredName">
          <Input defaultValue={employee.preferredName} />
        </Form.Item>
        <Divider>
          <Typography.Text type="secondary" style={{ fontSize: "14px" }}>
            {t("Emergency Contact")}
          </Typography.Text>
        </Divider>
        <Form.Item label={t("Name")} name="emergencyContactName">
          <Input defaultValue={employee.emergencyContact?.name} />
        </Form.Item>
        <Form.Item label={t("Phone Number")} name="emergencyContactPhoneNumber">
          <Input defaultValue={employee.emergencyContact?.phoneNumber} />
        </Form.Item>
        <Divider />
        <Form.Item label={t("Comments")} name="contactComments">
          <Input.TextArea defaultValue={employee.contactComments} />
        </Form.Item>
      </Form>
    </Card>
  );
}

export default EmployeeContactPanel;
