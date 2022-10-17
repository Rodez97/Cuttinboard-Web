/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  useCuttinboardModule,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  Positions,
  PrivacyLevel,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { useState } from "react";
import { recordError } from "../../utils/utils";
import {
  useNavigate,
  useLocation as useRouterLocation,
} from "react-router-dom";
import { Button, Form, Input, Radio, Select, Space, Spin } from "antd";
import { useTranslation } from "react-i18next";
import { GrayPageHeader } from "../../components/PageHeaders";

type FormType = {
  name: string;
  description?: string;
  positions?: string[];
  privacyLevel: PrivacyLevel;
};
// TODO: Crear una cceso directo para manejar los miembros

const ManageModule = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm<FormType>();
  const privacyLevel = Form.useWatch("privacyLevel", form);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { newElement, selectedApp, canManage } = useCuttinboardModule();
  const { pathname } = useRouterLocation();
  const navigate = useNavigate();
  const { location } = useLocation();

  const close = () => {
    navigate(-1);
  };

  const onFinish = async (values: FormType) => {
    if (!canManage) {
      return;
    }
    setIsSubmitting(true);
    try {
      if (selectedApp) {
        const { privacyLevel, positions, ...others } = values;
        if (selectedApp.privacyLevel === PrivacyLevel.POSITIONS) {
          const hosts = selectedApp.accessTags?.filter((at) =>
            at.startsWith("hostId_")
          );
          const accessTags = [...hosts, ...positions];
          await selectedApp.update({ ...others, accessTags });
        } else {
          await selectedApp.update(others);
        }
      } else {
        let newId: string;
        const { positions, ...others } = values;
        if (others.privacyLevel === PrivacyLevel.POSITIONS) {
          newId = await newElement({
            ...others,
            accessTags: positions,
          });
        } else {
          newId = await newElement(others);
        }
        navigate(pathname.replace("new", newId));
      }
      setIsSubmitting(false);
    } catch (error) {
      recordError(error);
      setIsSubmitting(false);
    }
  };

  const getInitialValues = () => {
    if (selectedApp) {
      const { privacyLevel, positions, name, description } = selectedApp;
      if (privacyLevel === PrivacyLevel.POSITIONS) {
        return { name, description, privacyLevel, positions };
      } else {
        return { name, description, privacyLevel };
      }
    }
    return {};
  };

  return (
    <Spin spinning={isSubmitting}>
      <GrayPageHeader
        onBack={() => navigate(-1)}
        title={selectedApp ? "Edit board" : "New board"}
      />
      <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
        <div
          css={{ minWidth: 270, maxWidth: 400, margin: "auto", width: "100%" }}
        >
          <Form<FormType>
            form={form}
            layout="vertical"
            style={{ width: "100%" }}
            onFinish={onFinish}
            disabled={isSubmitting}
            initialValues={getInitialValues()}
            autoComplete="off"
          >
            <Form.Item
              required
              name="name"
              label={t("Name")}
              rules={[{ required: true, message: "" }]}
            >
              <Input maxLength={80} showCount />
            </Form.Item>

            <Form.Item name="description" label={t("Description")}>
              <Input.TextArea maxLength={255} showCount rows={3} />
            </Form.Item>

            <Form.Item name="privacyLevel" label={t("Privacy Level")}>
              <Radio.Group disabled={Boolean(selectedApp)}>
                <Space direction="vertical">
                  <Radio value={PrivacyLevel.PUBLIC}>
                    {t(PrivacyLevel.PUBLIC)}
                  </Radio>
                  <Radio value={PrivacyLevel.POSITIONS}>
                    {t(PrivacyLevel.POSITIONS)}
                  </Radio>
                  <Radio value={PrivacyLevel.PRIVATE}>
                    {t(PrivacyLevel.PRIVATE)}
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            {privacyLevel === PrivacyLevel.POSITIONS && (
              <Form.Item<string[]>
                name="positions"
                label={t("Select Positions")}
                rules={[
                  {
                    validator(_, value) {
                      if (value && value.lenght < 1) {
                        return Promise.reject(
                          new Error(t("At least one position is required"))
                        );
                      }
                      if (value && value.lenght > 5) {
                        return Promise.reject(
                          new Error(t("Can't be more than 5 positions"))
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Select
                  mode="tags"
                  style={{ width: "100%" }}
                  tokenSeparators={[","]}
                >
                  {location.settings?.positions?.length && (
                    <Select.OptGroup label={t("Custom")}>
                      {location.settings.positions.map((pos) => (
                        <Select.Option key={pos} value={pos}>
                          {pos}
                        </Select.Option>
                      ))}
                    </Select.OptGroup>
                  )}

                  <Select.OptGroup label={t("Default")}>
                    {Positions.map((pos) => (
                      <Select.Option key={pos} value={pos}>
                        {pos}
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                </Select>
              </Form.Item>
            )}

            <Space
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "16px",
              }}
            >
              <Button danger disabled={isSubmitting} onClick={close}>
                {t("Cancel")}
              </Button>
              <Button htmlType="submit" loading={isSubmitting} type="primary">
                {t("Accept")}
              </Button>
            </Space>
          </Form>
        </div>
      </div>
    </Spin>
  );
};

export default ManageModule;
