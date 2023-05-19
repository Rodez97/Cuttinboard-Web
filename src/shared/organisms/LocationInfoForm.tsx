/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Button, Divider, Form, Input, Layout, Space } from "antd/es";
import { useTranslation } from "react-i18next";
import { CloseOutlined, SaveFilled } from "@ant-design/icons";
import { ILocationInfo } from "../../Dashboard/OwnerPortal/AddLocation/AddLocation";

function LocationInfoForm({
  baseLocation,
  onChange,
  loading,
  onCancel,
}: {
  baseLocation: ILocationInfo;
  onChange: (data: ILocationInfo) => void;
  loading?: boolean;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [form] = Form.useForm<ILocationInfo>();

  return (
    <Layout>
      <Layout.Content
        css={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          paddingBottom: 30,
          overflow: "auto",
        }}
      >
        <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
          <Form<ILocationInfo>
            form={form}
            layout="vertical"
            onFinish={onChange}
            initialValues={baseLocation}
            css={{
              minWidth: 270,
              maxWidth: 400,
              margin: "auto",
              width: "100%",
            }}
            disabled={loading}
            size="small"
            autoComplete="off"
          >
            <Divider orientation="left">{t("Information")}</Divider>
            <Form.Item
              required
              name="name"
              rules={[{ required: true, message: "" }]}
              label={t("Name")}
            >
              <Input maxLength={50} showCount />
            </Form.Item>
            <Form.Item name="intId" label={t("Internal ID")}>
              <Input maxLength={90} />
            </Form.Item>
            <Divider orientation="left">{t("Address")}</Divider>
            <Form.Item name="address">
              <Input.Group>
                <Form.Item
                  name={["address", "addressLine"]}
                  label={t("Address")}
                >
                  <Input />
                </Form.Item>
                <Form.Item name={["address", "city"]} label={t("City")}>
                  <Input />
                </Form.Item>
                <Form.Item name={["address", "state"]} label={t("State")}>
                  <Input />
                </Form.Item>
                <Form.Item name={["address", "zip"]} label={t("Zip Code")}>
                  <Input />
                </Form.Item>
              </Input.Group>
            </Form.Item>
          </Form>
        </div>
      </Layout.Content>

      <Layout.Footer>
        <Space css={{ justifyContent: "center", display: "flex" }}>
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
          <Button
            icon={<SaveFilled />}
            loading={loading}
            type="primary"
            block
            onClick={() => form.submit()}
          >
            {t("Save")}
          </Button>
        </Space>
      </Layout.Footer>
    </Layout>
  );
}

export default LocationInfoForm;
