/** @jsx jsx */
import { jsx } from "@emotion/react";
import { EditFilled, SaveFilled } from "@ant-design/icons";
import { useUpdateCuttinboardAccount } from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  Alert,
  Button,
  Card,
  Divider,
  Form,
  Input,
  message,
  Space,
  Typography,
} from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";
import { useDashboard } from "../DashboardProvider";

type EmployeeContactData = {
  phoneNumber: string;
  preferredName: string;
  emergencyContact: { name: string; phoneNumber: string };
  contactComments: string;
};

function ContactDetails() {
  const [form] = Form.useForm<EmployeeContactData>();
  const [editing, setEditing] = useState(false);
  const { t } = useTranslation();
  const { updateUserProfile, updating, error } = useUpdateCuttinboardAccount();
  const { userDocument } = useDashboard();

  const cancelEditing = () => {
    setEditing(false);
    form.resetFields();
  };

  const onFinish = async (values: EmployeeContactData) => {
    try {
      await updateUserProfile(values);
      setEditing(false);
      form.resetFields();
      message.success(t("Changes saved"));
    } catch (error) {
      recordError(error);
    }
  };

  console.log({ userDocument });

  return (
    <Space
      direction="vertical"
      css={{ maxWidth: 500, minWidth: 300, width: "100%", marginBottom: 3 }}
    >
      <Card title={t("Contact Details")}>
        <Form<EmployeeContactData>
          form={form}
          disabled={!editing || updating}
          initialValues={{ ...userDocument }}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item label={t("Phone Number")} name="phoneNumber">
            <Input maxLength={80} />
          </Form.Item>

          <Form.Item label={t("Preferred Name")} name="preferredName">
            <Input maxLength={30} showCount />
          </Form.Item>

          <Divider>
            <Typography.Text type="secondary" style={{ fontSize: "14px" }}>
              {t("Emergency Contact")}
            </Typography.Text>
          </Divider>

          <Form.Item label={t("Name")} name={["emergencyContact", "name"]}>
            <Input maxLength={20} showCount />
          </Form.Item>
          <Form.Item
            label={t("Phone Number")}
            name={["emergencyContact", "phoneNumber"]}
          >
            <Input maxLength={80} />
          </Form.Item>
          <Divider />
          <Form.Item label={t("Comments")} name="contactComments">
            <Input.TextArea rows={2} maxLength={255} showCount />
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
            <Button onClick={cancelEditing} disabled={updating}>
              {t("Cancel")}
            </Button>
          )}
          {editing ? (
            <Button
              icon={<SaveFilled />}
              loading={updating}
              onClick={form.submit}
              type="primary"
            >
              {t("Save")}
            </Button>
          ) : (
            <Button
              icon={<EditFilled />}
              loading={updating}
              onClick={() => setEditing(true)}
              type="link"
              disabled={false}
            >
              {t("Edit")}
            </Button>
          )}
        </Space>

        {error && <Alert message={t(error.message)} type="error" showIcon />}
      </Card>
    </Space>
  );
}

export default ContactDetails;
