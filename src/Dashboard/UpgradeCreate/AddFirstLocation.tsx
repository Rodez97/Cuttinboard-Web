/** @jsx jsx */
import { css, jsx } from "@emotion/react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  Layout,
  message,
  Space,
  Typography,
} from "antd/es";
import {
  FIRESTORE,
  FUNCTIONS,
  useCuttinboard,
} from "@cuttinboard-solutions/cuttinboard-library";
import { useNavigate } from "react-router-dom";
import FirstLocationSummary from "./FirstLocationSummary";
import { httpsCallable } from "firebase/functions";
import { recordError } from "../../utils/utils";
import { logAnalyticsEvent } from "utils/analyticsHelpers";
import { collection, doc, getDocs, query, where } from "firebase/firestore";
import {
  AddLocationContent,
  AddLocationHeader,
  AddLocationWrapper,
} from "../OwnerPortal/AddLocation/StyledComponents";
import { useDocumentDataOnce } from "react-firebase-hooks/firestore";
import { LoadingPage } from "../../shared";
import ErrorPage from "../../shared/molecules/PageError";
import {
  AddLocationFunctionArgs,
  gmValidationSchema,
  ILocationInfo,
  LocFormType,
} from "../OwnerPortal/AddLocation/NewLocationTypes";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useMediaQuery } from "@react-hook/media-query";

function AddFirstLocation() {
  const { user } = useCuttinboard();
  const [locationForm] = Form.useForm<LocFormType>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [addGM, setAddGM] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const matches = useMediaQuery("only screen and (max-width: 955px)");
  const [price, loadingPrice, priceError] = useDocumentDataOnce(
    doc(
      FIRESTORE,
      "Products",
      process.env.STRIPE_PRODUCT_ID,
      "prices",
      process.env.STRIPE_PRICE_ID
    )
  );

  const confirm = async (values: LocFormType) => {
    const { generalManager, promo, ...location } = values;

    const promoCode = promo?.length > 0 ? promo[0].promo : undefined;

    try {
      setIsLoading(true);

      const isGMValid = await gmValidationSchema.isValid(generalManager);

      if (isGMValid && generalManager) {
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
        location,
        generalManager: isGMValid ? generalManager : undefined,
        promo: promoCode,
      });

      message.success(t("Location added successfully"));
      // Go back to the previous page
      navigate("/dashboard/owner-portal");

      // Get the filled fields
      const usedFields = Object.keys(location).filter(
        (key) => location[key as keyof ILocationInfo]
      );
      // Report to analytics
      logAnalyticsEvent("location_created", {
        usedFields,
        gmAdded: isGMValid,
      });
    } catch (error) {
      console.log(error);

      setError(error);
      recordError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loadingPrice) {
    return <LoadingPage />;
  }

  if (priceError) {
    return <ErrorPage error={priceError} />;
  }

  if (!price) {
    return null;
  }

  return (
    <Form<LocFormType>
      form={locationForm}
      layout="vertical"
      initialValues={{
        ...location,
      }}
      onFinish={confirm}
      size="small"
      autoComplete="off"
      css={css`
        display: flex;
        flex-direction: column;
        flex: 1;
        @media (max-width: 900px) {
          overflow: auto;
        }
      `}
      disabled={isLoading}
    >
      <AddLocationWrapper>
        <AddLocationHeader>
          <Typography.Title level={4} css={{ marginTop: 0 }}>
            {t("Add a new location to your account")}
          </Typography.Title>

          <Typography.Paragraph>
            {t(
              "Define the location details and add a general manager if needed"
            )}
          </Typography.Paragraph>
        </AddLocationHeader>

        <AddLocationContent>
          <div
            css={{
              display: "flex",
              minWidth: 300,
              flexDirection: "column",
              paddingTop: 20,
            }}
          >
            <Space
              css={css`
                justify-content: space-evenly;
                display: flex;
                align-items: flex-start;
                @media (max-width: 900px) {
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  overflow: auto;
                }
              `}
            >
              <Form.Item css={{ minWidth: 200 }}>
                <Divider orientation="left">{t("Information")}</Divider>
                <Space.Compact
                  size="small"
                  direction="vertical"
                  css={{
                    width: "100%",
                  }}
                >
                  <Form.Item
                    required
                    name="name"
                    rules={[{ required: true, message: "" }]}
                    label={t("Location Name")}
                  >
                    <Input maxLength={50} showCount />
                  </Form.Item>
                  <Form.Item name="intId" label={t("Internal ID")}>
                    <Input maxLength={90} />
                  </Form.Item>
                </Space.Compact>
              </Form.Item>

              <Form.Item css={{ minWidth: 200 }}>
                <Divider orientation="left">{t("Address")}</Divider>
                <Space.Compact
                  direction="vertical"
                  size="small"
                  css={{
                    width: "100%",
                  }}
                >
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
                </Space.Compact>
              </Form.Item>

              <Form.Item css={{ minWidth: 200 }}>
                <Divider orientation="left">{t("General Manager")}</Divider>
                <Form.Item>
                  <Checkbox
                    checked={addGM}
                    onChange={(e) => setAddGM(e.target.checked)}
                  >
                    {t("Add General Manager?")}
                  </Checkbox>
                </Form.Item>
                <Space.Compact
                  css={{
                    display: addGM ? "block" : "none",
                    border: "1px dotted #00000025",
                    padding: 5,
                    width: "100%",
                  }}
                  direction="vertical"
                >
                  <Form.Item
                    name={["generalManager", "name"]}
                    rules={[
                      {
                        validator(_, value) {
                          if (!value && addGM) {
                            return Promise.reject();
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    label={t("Name")}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name={["generalManager", "lastName"]}
                    rules={[
                      {
                        validator(_, value) {
                          if (!value && addGM) {
                            return Promise.reject();
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    label={t("Last Name")}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name={["generalManager", "email"]}
                    rules={[
                      {
                        validator(_, value) {
                          if (!value && addGM) {
                            return Promise.reject();
                          }
                          if (value && addGM && value === user.email) {
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
                </Space.Compact>
              </Form.Item>
            </Space>

            {error && (
              <Alert message={t(error.message)} type="error" showIcon />
            )}
          </div>
        </AddLocationContent>

        <Layout.Footer>
          <Space
            css={
              matches
                ? { display: "flex", flexDirection: "column" }
                : { display: "flex", justifyContent: "space-between" }
            }
          >
            <FirstLocationSummary price={price} />
            <Space
              direction="vertical"
              css={{ justifyContent: "center", display: "flex", width: 250 }}
            >
              <Form.List name="promo">
                {(fields, { add, remove }) => (
                  <React.Fragment>
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
                  </React.Fragment>
                )}
              </Form.List>

              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isLoading}
              >
                {t("Create Location")}
              </Button>
              <Button type="dashed" danger onClick={handleCancel} block>
                {t("Take me back")}
              </Button>
            </Space>
          </Space>
        </Layout.Footer>
      </AddLocationWrapper>
    </Form>
  );
}

export default AddFirstLocation;
