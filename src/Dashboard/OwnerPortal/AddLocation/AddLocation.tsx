/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useState } from "react";
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
} from "antd";
import {
  FIRESTORE,
  FUNCTIONS,
  useCuttinboard,
} from "@cuttinboard-solutions/cuttinboard-library";
import { GMArgs } from "../../InitialForm/AddGM";
import {
  AddLocationContent,
  AddLocationHeader,
  AddLocationWrapper,
} from "./StyledComponents";
import { useNavigate } from "react-router-dom";
import NewLocationSummary from "./NewLocationSummary";
import { httpsCallable } from "firebase/functions";
import { recordError } from "../../../utils/utils";
import * as yup from "yup";
import { logAnalyticsEvent } from "firebase";
import { ILocationAddress } from "@cuttinboard-solutions/types-helpers";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useDashboard } from "../../DashboardProvider";

const gmValidationSchema = yup.object().shape({
  name: yup.string().required(),
  lastName: yup.string().required(),
  email: yup.string().email().required(),
});

type AddLocationFunctionArgs = {
  location: ILocationInfo;
  generalManager?: GMArgs;
};

type AddLocationFunctionResult =
  | {
      customerId: string;
      subscriptionId: string;
      organizationId: string;
    }
  | undefined
  | null;

export interface ILocationInfo {
  name: string;
  intId?: string;
  address?: ILocationAddress;
}

interface locFormType extends ILocationInfo {
  generalManager?: GMArgs;
}

function AddLocation() {
  const { user } = useCuttinboard();
  const [locationForm] = Form.useForm<locFormType>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [addGM, setAddGM] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { organization } = useDashboard();

  const onFinish = async (values: locFormType) => {
    const { generalManager, ...location } = values;
    try {
      setIsLoading(true);
      const addLocation = httpsCallable<
        AddLocationFunctionArgs,
        AddLocationFunctionResult
      >(FUNCTIONS, "http-locations-create");
      const isGMValid = await gmValidationSchema.isValid(generalManager);

      if (isGMValid) {
        // Check if the new employee is already an organization level employee
        const checkForSupervisor = await getDocs(
          query(
            collection(FIRESTORE, "Organizations", user.uid, "employees"),
            where("email", "==", generalManager?.email.toLowerCase())
          )
        );
        if (checkForSupervisor.size === 1) {
          throw new Error("Employee is already an organization level employee");
        }
      }

      await addLocation({
        location,
        generalManager: isGMValid ? generalManager : undefined,
      });
      message.success(t("Location added successfully"));
      // Go back to the previous page
      navigate(-1);

      // Get the filled fields
      const usedFields = Object.keys(location).filter(
        (key) => location[key as keyof ILocationInfo]
      );
      // Report to analytics
      logAnalyticsEvent("location_created", {
        usedFields,
        gmAdded: isGMValid,
        numberOfLocations: organization?.locations
          ? organization.locations + 1
          : 0,
      });
    } catch (error) {
      setError(error);
      recordError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <Form<locFormType>
      form={locationForm}
      layout="vertical"
      initialValues={{
        ...location,
      }}
      onFinish={onFinish}
      size="small"
      autoComplete="off"
      css={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
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
              wrap
              css={{
                justifyContent: "space-evenly",
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <Form.Item css={{ minWidth: 280 }}>
                <Divider orientation="left">{t("Information")}</Divider>
                <Input.Group size="small">
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
                </Input.Group>
              </Form.Item>

              <Form.Item css={{ minWidth: 280 }}>
                <Divider orientation="left">{t("Address")}</Divider>
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

              <Form.Item css={{ minWidth: 280 }}>
                <Divider orientation="left">{t("General Manager")}</Divider>
                <Form.Item>
                  <Checkbox
                    checked={addGM}
                    onChange={(e) => setAddGM(e.target.checked)}
                  >
                    {t("Add General Manager?")}
                  </Checkbox>
                </Form.Item>
                <Input.Group
                  css={{
                    display: addGM ? "block" : "none",
                    border: "1px dotted #00000025",
                    padding: 5,
                  }}
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
                </Input.Group>
              </Form.Item>
            </Space>

            {error && (
              <Alert message={t(error.message)} type="error" showIcon />
            )}
          </div>
        </AddLocationContent>

        <Layout.Footer>
          <Space css={{ display: "flex", justifyContent: "space-between" }}>
            <NewLocationSummary />
            <Space
              direction="vertical"
              css={{ justifyContent: "center", display: "flex", width: 150 }}
            >
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

export default AddLocation;
