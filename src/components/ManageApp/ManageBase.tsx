/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  Positions,
  PrivacyLevel,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library";
import { Button, Form, Input, Radio, Select, Space, Spin } from "antd";
import { GrayPageHeader } from "components/PageHeaders";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { recordError } from "../../utils/utils";
import { isEmpty } from "lodash";

export interface BaseApp {
  id: string;
  name: string;
  description?: string;
  privacyLevel: PrivacyLevel;
  members?: string[];
  positions?: string[];
}

interface ManageBaseProps {
  title: string;
  create: (newData: Partial<BaseApp>) => Promise<void>;
  edit: (newData: Partial<BaseApp>) => Promise<void>;
  baseApp?: BaseApp;
}

type FormType = {
  name: string;
  description?: string;
  positions?: string[];
  privacyLevel: PrivacyLevel;
};

// TODO: Crear una cceso directo para manejar los miembros

const ManageBase = ({ title, create, edit, baseApp }: ManageBaseProps) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<FormType>();
  const privacyLevel = Form.useWatch("privacyLevel", form);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { location } = useLocation();

  const close = () => {
    navigate(-1);
  };

  const onFinish = async (values: FormType) => {
    setIsSubmitting(true);
    try {
      if (baseApp) {
        await edit(values);
      } else {
        await create(values);
      }
      setIsSubmitting(false);
    } catch (error) {
      recordError(error);
      setIsSubmitting(false);
    }
  };

  return (
    <Spin spinning={isSubmitting}>
      <GrayPageHeader onBack={() => navigate(-1)} title={title} />
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
            initialValues={{
              name: "",
              description: "",
              privacyLevel: PrivacyLevel.PUBLIC,
              positions: [],
              ...baseApp,
            }}
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
              <Radio.Group disabled={!isEmpty(baseApp)}>
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

export default ManageBase;
