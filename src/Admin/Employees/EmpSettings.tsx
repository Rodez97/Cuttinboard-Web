/** @jsx jsx */
import { jsx } from "@emotion/react";
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
} from "antd/es";
import {
  MinusCircleOutlined,
  PlusOutlined,
  SaveFilled,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { GrayPageHeader } from "../../shared";
import {
  useCuttinboardLocation,
  useEmployees,
} from "@rodez97/cuttinboard-library";
import { Timestamp } from "firebase/firestore";
import {
  EmployeeLocationInfo,
  getEmployeeFullName,
  getEmployeeHourlyWage,
  ManagerPermissions,
  POSITIONS,
  RoleAccessLevels,
  roleToString,
} from "@rodez97/types-helpers";
import PermissionsChecker from "./PermissionsChecker";
import imgAvatar from "../../assets/images/avatar.webp";
import { logAnalyticsEvent } from "../../utils/analyticsHelpers";
import { compact } from "lodash-es";

type EmployeeRoleData = {
  positions?: { position: string; wage: number }[];
  role: RoleAccessLevels;
  employeeDataComments?: string;
  permissions?: ManagerPermissions;
};

export default () => {
  const { id } = useParams();
  if (!id) throw new Error("No id provided");
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form] = Form.useForm<EmployeeRoleData>();
  const { location, role } = useCuttinboardLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updateEmployee, getEmployeeById } = useEmployees();

  const employee = useMemo(() => getEmployeeById(id), [getEmployeeById, id]);

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
      const dataToAdd: EmployeeLocationInfo = {
        ...values,
        positions: positions ? positions.map((pos) => pos.position) : [],
        wagePerPosition: positions
          ? positions.reduce(
              (acc, pos) => ({ ...acc, [pos.position]: pos.wage }),
              {}
            )
          : {},
        mainPosition: "",
        startDate: Timestamp.now().toMillis(),
      };
      updateEmployee(employee, dataToAdd);
      message.success(t("Changes saved"));
      // Report to analytics
      logAnalyticsEvent("employee_role_wage_updated", {
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
        wage: getEmployeeHourlyWage(employee, pos),
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
        title={getEmployeeFullName(employee)}
        subTitle={t("Employee settings")}
        avatar={{
          src: employee.avatar ? employee.avatar : imgAvatar,
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
              role: employee.role,
              positions: getPositions(),
              employeeDataComments: employee.employeeDataComments,
              permissions: employee.permissions ?? {},
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
                options={Object.values(RoleAccessLevels)
                  .filter(
                    (p: number) => p > role && p !== RoleAccessLevels.ADMIN
                  )
                  .map((role: RoleAccessLevels) => ({
                    label: t(roleToString(role)),
                    value: role,
                  }))}
              />
            </Form.Item>
            <Form.Item
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.role !== currentValues.role
              }
            >
              {({ getFieldValue }) => {
                const role = getFieldValue("role");

                if (role !== RoleAccessLevels.MANAGER) {
                  return null;
                }

                return (
                  <Form.Item name="permissions">
                    <PermissionsChecker />
                  </Form.Item>
                );
              }}
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
