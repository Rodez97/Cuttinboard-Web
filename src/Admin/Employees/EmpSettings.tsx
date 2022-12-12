/** @jsx jsx */
import { jsx } from "@emotion/react";
import { setDoc } from "firebase/firestore";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";
import {
  Button,
  Divider,
  Form,
  Input,
  InputNumber,
  Layout,
  message,
  Select,
  Space,
  Typography,
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  SaveFilled,
  UserOutlined,
} from "@ant-design/icons";
import { compact } from "lodash";
import { getAnalytics, logEvent } from "firebase/analytics";
import { useNavigate, useParams } from "react-router-dom";
import { GrayPageHeader } from "../../shared";
import {
  POSITIONS,
  RoleAccessLevels,
  roleToString,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { useEmployeesList } from "@cuttinboard-solutions/cuttinboard-library/employee";
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library/services";

type EmployeeRoleData = {
  positions?: { position: string; wage: number }[];
  role: RoleAccessLevels;
  mainPosition?: string;
  employeeDataComments?: string;
};

export default () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getEmployeeById } = useEmployeesList();
  const [form] = Form.useForm<EmployeeRoleData>();
  const { availablePositions, location } = useCuttinboardLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const employee = useMemo(
    () => (id ? getEmployeeById(id) : null),
    [getEmployeeById, id]
  );

  const cancel = () => {
    navigate(-1);
    form.resetFields();
  };

  const onFinish = async ({ positions, ...values }: EmployeeRoleData) => {
    if (!employee) {
      throw new Error("Employee not found");
    }
    try {
      setIsSubmitting(true);
      const dataToAdd = {
        ...values,
        pos: positions ? positions.map((pos) => pos.position) : [],
        wagePerPosition: positions
          ? positions.reduce(
              (acc, pos) => ({ ...acc, [pos.position]: pos.wage }),
              {}
            )
          : {},
      };
      await setDoc(
        employee.docRef,
        {
          locations: {
            [location.id]: dataToAdd,
          },
        },
        { merge: true }
      );
      message.success(t("Changes saved"));
      // Report to analytics
      logEvent(getAnalytics(), "employee_role_wage_updated", {
        employeeId: employee.id,
        locationId: location.id,
      });
    } catch (error) {
      recordError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPositions = () => {
    if (!employee) {
      throw new Error("Employee not found");
    }
    return employee.positions?.map((pos) => {
      return {
        position: pos,
        wage: employee.getHourlyWage(pos),
      };
    });
  };

  if (!employee) {
    return null;
  }

  return (
    <Layout>
      <GrayPageHeader
        onBack={cancel}
        title={employee.fullName}
        subTitle={t("Role, Positions & Hourly Wages")}
        avatar={{
          src: employee.avatar,
          icon: <UserOutlined />,
          alt: employee.fullName,
        }}
      />
      <Layout.Content
        css={{
          display: "flex",
          flexDirection: "column",
          padding: 20,
          paddingBottom: 30,
        }}
      >
        <div
          css={{
            minWidth: 300,
            maxWidth: 500,
            margin: "auto",
            width: "100%",
          }}
        >
          <Form<EmployeeRoleData>
            layout="vertical"
            form={form}
            initialValues={{
              role: employee.locationRole,
              positions: getPositions(),
              employeeDataComments: employee.locationData?.employeeDataComments,
              mainPosition: employee.locationData?.mainPosition,
            }}
            disabled={isSubmitting}
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label={t("Role")}
              name="role"
              rules={[{ required: true, message: "" }]}
            >
              <Select
                defaultValue={RoleAccessLevels.STAFF}
                options={availablePositions
                  .filter((p) => p !== RoleAccessLevels.ADMIN)
                  .map((role) => ({
                    label: t(roleToString(role)),
                    value: role,
                  }))}
              />
            </Form.Item>
            <Divider>
              <Typography.Text type="secondary" style={{ fontSize: "14px" }}>
                {t("Position/Wage")}
              </Typography.Text>
            </Divider>
            <Form.List
              name="positions"
              rules={[
                {
                  validator: async (
                    _,
                    positions: { position: string; wage?: number }[]
                  ) => {
                    const compactPositions = compact(positions);
                    // Check if there are repeated positions
                    if (
                      compactPositions.length !==
                      new Set(compactPositions.map((p) => p.position)).size
                    ) {
                      return Promise.reject(
                        new Error(t("Position must be unique"))
                      );
                    }
                    // Check if there are more than 5 positions
                    if (compactPositions.length > 5) {
                      return Promise.reject(
                        new Error(t("Max 5 positions per employee"))
                      );
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <React.Fragment>
                  {fields.map(({ key, name, ...restField }) => (
                    <div
                      key={key}
                      css={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 1,
                        marginBottom: 8,
                        width: "100%",
                      }}
                    >
                      <div
                        css={{
                          display: "flex",
                          flexDirection: "row",
                          gap: 1,
                          width: "100%",
                        }}
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "position"]}
                          validateTrigger={["onChange", "onBlur"]}
                          rules={[
                            {
                              required: true,
                              message: t("Position is required"),
                            },
                          ]}
                          css={{ width: "50%" }}
                        >
                          <Select showSearch placeholder={t("Position")}>
                            {location.settings?.positions?.length && (
                              <Select.OptGroup label={t("Custom")}>
                                {location.settings.positions.map((pos) => (
                                  <Select.Option value={pos} key={pos}>
                                    {pos}
                                  </Select.Option>
                                ))}
                              </Select.OptGroup>
                            )}

                            <Select.OptGroup label={t("Default")}>
                              {POSITIONS.map((pos) => (
                                <Select.Option value={pos} key={pos}>
                                  {pos}
                                </Select.Option>
                              ))}
                            </Select.OptGroup>
                          </Select>
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "wage"]}
                          css={{ width: "50%" }}
                        >
                          <InputNumber
                            css={{ width: "100%" }}
                            min={0}
                            placeholder={t("Hourly Wage")}
                            step={0.25}
                          />
                        </Form.Item>
                      </div>
                      <Button
                        css={{ width: 30 }}
                        type="text"
                        shape="circle"
                        onClick={() => remove(name)}
                        icon={<MinusCircleOutlined />}
                        disabled={isSubmitting}
                      />
                    </div>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      {t("Add Position")}
                    </Button>
                  </Form.Item>
                  <Form.ErrorList errors={errors} css={{ marginBottom: 10 }} />
                </React.Fragment>
              )}
            </Form.List>
            <Form.Item
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.positions !== currentValues.positions
              }
            >
              {({ getFieldValue }) => {
                const positions: EmployeeRoleData["positions"] =
                  getFieldValue("positions");

                const compactPositions = positions ? compact(positions) : [];

                if (compactPositions.length === 0) {
                  return null;
                }
                return (
                  <Form.Item label={t("Main Position")} name="mainPosition">
                    <Select
                      options={compactPositions.map(({ position }) => ({
                        label: position,
                        value: position,
                      }))}
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>
            <Form.Item label={t("Comments")} name="employeeDataComments">
              <Input.TextArea rows={2} maxLength={255} showCount />
            </Form.Item>
          </Form>
          <Space
            direction="vertical"
            style={{
              display: "flex",
            }}
          >
            <Button
              icon={<SaveFilled />}
              loading={isSubmitting}
              onClick={form.submit}
              type="primary"
              block
            >
              {t("Save")}
            </Button>
            <Button
              onClick={cancel}
              disabled={isSubmitting}
              block
              danger
              type="dashed"
            >
              {t("Cancel")}
            </Button>
          </Space>
        </div>
      </Layout.Content>
    </Layout>
  );
};
