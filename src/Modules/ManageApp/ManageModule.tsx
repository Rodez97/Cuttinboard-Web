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
import useDisclose from "../../hooks/useDisclose";

type FormType = {
  name: string;
  description?: string;
  position?: string;
  privacyLevel: PrivacyLevel;
};

const ManageModule = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm<FormType>();
  const privacyLevel = Form.useWatch("privacyLevel", form);
  const [isSubmitting, startSubmit, endSubmit] = useDisclose();
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
    startSubmit();
    try {
      if (selectedApp) {
        const { privacyLevel, position, ...others } = values;
        if (selectedApp.privacyLevel === PrivacyLevel.POSITIONS) {
          const hosts = selectedApp.accessTags?.filter((at) =>
            at.startsWith("hostId_")
          );
          const accessTags = [...hosts, position];
          await selectedApp.update({ ...others, accessTags });
        } else {
          await selectedApp.update(others);
        }
      } else {
        let newId: string;
        const { position, ...others } = values;
        if (others.privacyLevel === PrivacyLevel.POSITIONS) {
          newId = await newElement({
            ...others,
            accessTags: [position],
          });
        } else {
          newId = await newElement(others);
        }
        navigate(pathname.replace("new", newId));
      }
      endSubmit();
    } catch (error) {
      recordError(error);
      endSubmit();
    }
  };

  const getInitialValues = () => {
    if (selectedApp) {
      const { privacyLevel, accessTags, name, description } = selectedApp;
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
              rules={[
                { required: true, message: "" },
                {
                  whitespace: true,
                  message: t("Cannot be empty"),
                },
                {
                  validator: async (_, value) => {
                    // Check if value dont hace tailing or leading spaces
                    if (value !== value.trim()) {
                      return Promise.reject(
                        new Error(t("Cannot have leading or trailing spaces"))
                      );
                    }
                  },
                },
              ]}
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
};

export default ManageModule;
