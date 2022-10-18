/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Button, Form, Input } from "antd";
import { useTranslation } from "react-i18next";
import { CloseOutlined, SaveFilled } from "@ant-design/icons";
import { Location } from "@cuttinboard-solutions/cuttinboard-library/models";

function LocationEditor({
  baseLocation,
  onChange,
  loading,
  onCancel,
}: {
  baseLocation: Partial<Location>;
  onChange: (data: Partial<Location>) => void;
  loading?: boolean;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  return (
    <Form<Partial<Location>>
      form={form}
      layout="vertical"
      onFinish={onChange}
      initialValues={baseLocation}
      css={{ width: 300, paddingBottom: 20 }}
      disabled={loading}
      size="small"
      autoComplete="off"
    >
      <Form.Item required name="name" rules={[{ required: true, message: "" }]}>
        <Input maxLength={50} showCount placeholder={t("Name")} />
      </Form.Item>
      <Form.Item
        name="email"
        rules={[{ type: "email", message: t("Must be a valid email") }]}
      >
        <Input type="email" maxLength={100} placeholder={t("Email")} />
      </Form.Item>
      <Form.Item name="phoneNumber">
        <Input
          type="phoneNumber"
          maxLength={30}
          placeholder={t("Phone Number")}
        />
      </Form.Item>
      <Form.Item name="intId">
        <Input maxLength={90} placeholder={t("Internal ID")} />
      </Form.Item>
      <Form.Item name="description">
        <Input maxLength={255} showCount placeholder={t("Description")} />
      </Form.Item>
      <Form.Item label={t("Address")} name="address">
        <Input.Group>
          <Form.Item name={["address", "streetNumber"]}>
            <Input placeholder={t("Address Line 1")} />
          </Form.Item>
          <Form.Item name={["address", "street"]}>
            <Input placeholder={t("Address Line 2")} />
          </Form.Item>
          <Form.Item name={["address", "city"]}>
            <Input placeholder={t("City")} />
          </Form.Item>
          <Form.Item name={["address", "state"]}>
            <Input placeholder={t("State")} />
          </Form.Item>
          <Form.Item name={["address", "country"]}>
            <Input placeholder={t("Country")} />
          </Form.Item>
          <Form.Item name={["address", "zip"]}>
            <Input placeholder={t("Zip")} />
          </Form.Item>
        </Input.Group>
      </Form.Item>

      <Form.Item>
        <Button
          icon={<SaveFilled />}
          loading={loading}
          htmlType="submit"
          type="primary"
          block
        >
          {t("Save")}
        </Button>
      </Form.Item>
      <Form.Item>
        <Button
          icon={<CloseOutlined />}
          disabled={loading}
          type="dashed"
          danger
          block
          onClick={onCancel}
        >
          {t("Cancel")}
        </Button>
      </Form.Item>
    </Form>
  );
}

export default LocationEditor;
