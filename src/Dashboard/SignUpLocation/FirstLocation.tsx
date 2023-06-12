/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  Alert,
  Button,
  Divider,
  Form,
  Input,
  Space,
  Typography,
} from "antd/es";
import { useTranslation } from "react-i18next";
import { useWizard } from "react-use-wizard";
import { TrimRule, recordError } from "../../utils/utils";
import { LocationSectionWrapper } from "./SectionWrapper";
import React, { useState } from "react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  FIRESTORE,
  FUNCTIONS,
  useCuttinboard,
} from "@cuttinboard-solutions/cuttinboard-library";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { AddLocationFunctionArgs } from "../OwnerPortal/AddLocation/NewLocationTypes";
import { logAnalyticsEvent } from "../../utils/analyticsHelpers";
import useSignUpLocalTracker from "../../hooks/useSignUpLocalTracker";

type LocationFormType = {
  name: string;
  gm: {
    name: string;
    lastName: string;
    email: string;
  }[];
  promo: {
    promo: string;
  }[];
};

function FirstLocation() {
  const [form] = Form.useForm<LocationFormType>();
  const { user } = useCuttinboard();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { previousStep } = useWizard();
  const [, , removeNewUser] = useSignUpLocalTracker();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  const handleNext = async (values: LocationFormType) => {
    const { name, gm, promo } = values;

    const generalManager = gm?.length > 0 ? gm[0] : undefined;

    const promoCode = promo?.length > 0 ? promo[0].promo : undefined;

    try {
      setError(undefined);
      setLoading(true);
      if (generalManager?.email) {
        // Check if the new employee is already an organization level employee
        const checkForSupervisor = await getDocs(
          query(
            collection(FIRESTORE, "Organizations", user.uid, "employees"),
            where("email", "==", generalManager.email.trim().toLowerCase())
          )
        );
        if (checkForSupervisor.size === 1) {
          throw new Error("Employee is already an organization level employee");
        }
      }

      const upgradeAccount = httpsCallable<AddLocationFunctionArgs, void>(
        FUNCTIONS,
        "http-locations-upgradecreate"
      );
      await upgradeAccount({
        location: {
          name: name.trim(),
        },
        generalManager: generalManager
          ? {
              name: generalManager.name.trim(),
              lastName: generalManager.lastName.trim(),
              email: generalManager.email.trim().toLowerCase(),
            }
          : undefined,
        promo: promoCode,
      });
      // Report to analytics
      logAnalyticsEvent("sign_up_flow", {
        type: "owner",
        gmAdded: Boolean(generalManager),
      });
      // Redirect to dashboard
      navigate("/dashboard/owner-portal");
      // Remove new user
      removeNewUser();
    } catch (error) {
      setError(error);
      recordError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocationSectionWrapper>
      <Typography.Title
        level={2}
        css={{
          textAlign: "center",
        }}
      >
        {t("Let's create your first location. You can add more later")}
      </Typography.Title>
      <Form<LocationFormType>
        layout="vertical"
        autoComplete="off"
        autoCorrect="off"
        size="small"
        onFinish={handleNext}
        form={form}
        css={{
          maxWidth: 400,
          width: "100%",
          margin: "0 auto",
        }}
        disabled={loading}
      >
        <Form.Item
          required
          name="name"
          rules={[
            {
              required: true,
              message: t("You must enter a name for your location"),
            },
            {
              max: 40,
              message: t("Name must be 20 characters or less"),
            },
            {
              whitespace: true,
              message: t("Name cannot be empty"),
            },
            TrimRule,
          ]}
          label={t("What is the name of your location?")}
          extra={t("You can edit or add more details later")}
        >
          <Input
            placeholder={t('e.g. "The Garden Cafe"')}
            maxLength={40}
            showCount
          />
        </Form.Item>

        <Divider />

        <Form.List name="gm">
          {(fields, { add, remove }) => (
            <React.Fragment>
              {fields.map((field) => (
                <div key={field.key}>
                  <div
                    key={field.key}
                    css={{
                      display: "flex",
                      gap: 8,
                      flexDirection: "row",
                    }}
                  >
                    <Form.Item
                      name={[field.name, "name"]}
                      label={t("Name")}
                      rules={[
                        {
                          required: true,
                          message: "",
                        },
                        {
                          max: 20,
                          message: t("Name must be 20 characters or less"),
                        },
                        {
                          whitespace: true,
                          message: t("Name cannot be empty"),
                        },
                      ]}
                      css={{
                        flex: 1,
                      }}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name={[field.name, "lastName"]}
                      label={t("Last Name")}
                      rules={[
                        {
                          required: true,
                          message: "",
                        },
                        {
                          max: 20,
                          message: t("Name must be 20 characters or less"),
                        },
                        {
                          whitespace: true,
                          message: t("Name cannot be empty"),
                        },
                      ]}
                      css={{
                        flex: 1,
                      }}
                    >
                      <Input />
                    </Form.Item>
                  </div>

                  <Form.Item
                    name={[field.name, "email"]}
                    rules={[
                      {
                        required: true,
                        message: "",
                      },
                      {
                        validator(_, value) {
                          if (value && value === user.email) {
                            return Promise.reject(
                              new Error(t("You can't be the GM"))
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                      { type: "email", message: t("Must be a valid email") },
                    ]}
                    label={t("Email")}
                  >
                    <Input />
                  </Form.Item>
                </div>
              ))}

              <Form.Item>
                {fields.length === 0 ? (
                  <Button
                    type="dashed"
                    onClick={() => add(undefined, 0)}
                    block
                    icon={<PlusOutlined />}
                  >
                    {t("Add General Manager")}
                  </Button>
                ) : (
                  <Button
                    type="dashed"
                    onClick={() => remove(0)}
                    block
                    icon={<MinusCircleOutlined />}
                    danger
                  >
                    {t("Remove General Manager")}
                  </Button>
                )}
              </Form.Item>
            </React.Fragment>
          )}
        </Form.List>

        <Divider />

        <Form.List name="promo">
          {(fields, { add, remove }) => (
            <React.Fragment>
              {fields.map((field) => (
                <Form.Item
                  key={field.key}
                  name={[field.name, "promo"]}
                  rules={[
                    {
                      required: true,
                      message: "",
                    },
                  ]}
                  label={t("Promo Code")}
                >
                  <Input />
                </Form.Item>
              ))}

              <Form.Item>
                {fields.length === 0 ? (
                  <Button
                    type="dashed"
                    onClick={() => add(undefined, 0)}
                    block
                    icon={<PlusOutlined />}
                  >
                    {t("Do you have a promo code?")}
                  </Button>
                ) : (
                  <Button
                    type="dashed"
                    onClick={() => remove(0)}
                    block
                    icon={<MinusCircleOutlined />}
                    danger
                  >
                    {t("Remove Promo Code")}
                  </Button>
                )}
              </Form.Item>
            </React.Fragment>
          )}
        </Form.List>

        {error && <Alert type="error" message={t(error.message)} />}

        <Divider />

        <Space
          size="large"
          css={{
            width: "100%",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Button
            onClick={previousStep}
            type="dashed"
            size="large"
            disabled={loading}
          >
            {t("Back")}
          </Button>
          <Button
            htmlType="submit"
            type="primary"
            size="large"
            loading={loading}
          >
            {t("Done")}
          </Button>
        </Space>
      </Form>
    </LocationSectionWrapper>
  );
}

export default FirstLocation;
