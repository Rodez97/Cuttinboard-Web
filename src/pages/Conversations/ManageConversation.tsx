/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Conversation } from "@cuttinboard-solutions/cuttinboard-library/models";
import {
  useConversations,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { useState } from "react";
import { recordError } from "../../utils/utils";
import {
  useNavigate,
  useLocation as useRouterLocation,
} from "react-router-dom";
import {
  Positions,
  PrivacyLevel,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Button, Form, Input, Radio, Select, Space, Spin } from "antd";
import { isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import { GrayPageHeader } from "../../components/PageHeaders";

interface ManageConversationProps {
  baseConversation?: Conversation;
}

type FormType = {
  name: string;
  description?: string;
  position: string;
  privacyLevel: PrivacyLevel;
};

function ManageConversation({ baseConversation }: ManageConversationProps) {
  const { t } = useTranslation();
  const isEditing = !isEmpty(baseConversation);
  const [form] = Form.useForm<FormType>();
  const privacyLevel = Form.useWatch("privacyLevel", form);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createConversation, canManage } = useConversations();
  const { location } = useLocation();
  const { pathname } = useRouterLocation();
  const navigate = useNavigate();

  const onFinish = async (values: FormType) => {
    if (!canManage) {
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEditing) {
        const { privacyLevel, position, ...others } = values;
        if (baseConversation.privacyLevel === PrivacyLevel.POSITIONS) {
          const hosts = baseConversation.accessTags?.filter((at) =>
            at.startsWith("hostId_")
          );
          const accessTags = [...hosts, position];
          await baseConversation.update({ ...others, accessTags });
        } else {
          await baseConversation.update(others);
        }
      } else {
        let newId: string;
        const { position, ...others } = values;
        if (others.privacyLevel === PrivacyLevel.POSITIONS) {
          const accessTags = [position];
          newId = await createConversation({ ...others, accessTags });
        } else {
          newId = await createConversation(others);
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
    if (isEditing) {
      const { privacyLevel, accessTags, name, description } = baseConversation;
      if (privacyLevel === PrivacyLevel.POSITIONS) {
        const position = accessTags?.find((at) => !at.startsWith("hostId_"));
        return { name, description, privacyLevel, position };
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
        title={isEditing ? "Edit conversation" : "New conversation"}
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

            <Form.Item
              required
              name="privacyLevel"
              label={t("Privacy Level")}
              rules={[
                {
                  required: true,
                  message: "",
                },
              ]}
            >
              <Radio.Group disabled={isEditing}>
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
              <Form.Item
                required
                name="position"
                label={t("Select Position")}
                rules={[
                  {
                    required: true,
                    message: "",
                  },
                ]}
              >
                <Select css={{ width: "100%" }} allowClear showSearch>
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
}

export default ManageConversation;
