/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Button, Divider, Form, Input } from "antd";
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
      css={{ width: "100%", paddingBottom: 20 }}
      disabled={loading}
      size="small"
      autoComplete="off"
    >
      <Form.Item
        required
        name="name"
        rules={[{ required: true, message: "" }]}
        label={t("Name")}
      >
        <Input maxLength={50} showCount />
      </Form.Item>
      <Form.Item
        name="email"
        rules={[{ type: "email", message: t("Must be a valid email") }]}
        label={t("Email")}
      >
        <Input type="email" maxLength={100} />
      </Form.Item>
      <Form.Item name="phoneNumber" label={t("Phone Number")}>
        <Input type="phoneNumber" maxLength={30} />
      </Form.Item>
      <Form.Item name="intId" label={t("Internal ID")}>
        <Input maxLength={90} />
      </Form.Item>
      <Form.Item name="description" label={t("Description")}>
        <Input maxLength={255} showCount />
      </Form.Item>
      <Divider orientation="left">{t("Address")}</Divider>
      <Form.Item name="address">
        <Input.Group>
          <Form.Item
            name={["address", "streetNumber"]}
            label={t("Address Line 1")}
          >
            <Input />
          </Form.Item>
          <Form.Item name={["address", "street"]} label={t("Address Line 2")}>
            <Input />
          </Form.Item>
          <Form.Item name={["address", "city"]} label={t("City")}>
            <Input />
          </Form.Item>
          <Form.Item name={["address", "state"]} label={t("State")}>
            <Input />
          </Form.Item>
          <Form.Item name={["address", "country"]} label={t("Country")}>
            <Input />
          </Form.Item>
          <Form.Item name={["address", "zip"]} label={t("Zip")}>
            <Input />
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
