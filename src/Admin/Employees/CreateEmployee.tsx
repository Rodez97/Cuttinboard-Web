/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";
import {
  Button,
  Drawer,
  DrawerProps,
  Form,
  Input,
  InputNumber,
  message,
  Select,
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  SaveFilled,
} from "@ant-design/icons";
import { compact } from "lodash";
import {
  useAddEmployee,
  useCuttinboardLocation,
} from "@cuttinboard-solutions/cuttinboard-library";
import { logAnalyticsEvent } from "firebase";
import {
  ManagerPermissions,
  POSITIONS,
  RoleAccessLevels,
  roleToString,
} from "@cuttinboard-solutions/types-helpers";
import PermissionsChecker from "./PermissionsChecker";

type EmployeeData = {
  name: string;
  lastName: string;
  email: string;
  positions?: { position: string; wage: number }[];
  role:
    | RoleAccessLevels.GENERAL_MANAGER
    | RoleAccessLevels.MANAGER
    | RoleAccessLevels.STAFF;
  permissions?: ManagerPermissions;
};

/**
 * Form for creating a new employee.
 */
function CreateEmployee(props: DrawerProps) {
  const [form] = Form.useForm<EmployeeData>();
  const { location, role } = useCuttinboardLocation();
  const { t } = useTranslation();
  const addEmployee = useAddEmployee();
  const [loading, setLoading] = useState(false);

  const onFinish = async ({ positions, ...values }: EmployeeData) => {
    const wagePerPosition = positions
      ? positions.reduce(
          (acc, pos) => ({ ...acc, [pos.position]: pos.wage }),
          {}
        )
      : {};

    const employeeToAdd = {
      ...values,
      positions: positions ? positions.map((pos) => pos.position) : [],
      wagePerPosition,
      mainPosition: "",
    };

    try {
      setLoading(true);
      const result = await addEmployee(employeeToAdd);
      message.success(t(result));
      const newAccount =
        result ===
        "An account has been created and a temporary password has been emailed to this user";
      form.resetFields();
      logAnalyticsEvent("employee_created", {
        newAccount,
        wagePerPosition,
        role: roleToString(values.role),
        permissions: values.permissions,
      });
    } catch (error) {
      message.error(t(error.message));
      recordError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer {...props} title={t("Add Employee")} placement="right">
      <Form<EmployeeData>
        form={form}
        css={{ minWidth: 280, maxWidth: 500, margin: "auto" }}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          name: "",
          lastName: "",
          email: "",
          role: RoleAccessLevels.STAFF,
          positions: [],
          permissions: {},
        }}
        disabled={loading}
        autoComplete="off"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
      >
        <Form.Item
          required
          label={t("Name")}
          name="name"
          rules={[
            { required: true, message: "" },
            {
              max: 20,
              message: t("Name must be 20 characters or less"),
            },
            {
              whitespace: true,
              message: t("Name cannot be empty"),
            },
            {
              validator: async (_, value) => {
                // Check if value don't have tailing or leading spaces
                if (value !== value.trim()) {
                  return Promise.reject(
                    new Error(t("Name cannot have leading or trailing spaces"))
                  );
                }
              },
            },
          ]}
        >
          <Input maxLength={20} showCount />
        </Form.Item>
        <Form.Item
          required
          label={t("Last Name")}
          name="lastName"
          rules={[
            { required: true, message: "" },
            {
              max: 20,
              message: t("Last Name must be 20 characters or less"),
            },
            {
              whitespace: true,
              message: t("Name cannot be empty"),
            },
            {
              validator: async (_, value) => {
                // Check if value don't have tailing or leading spaces
                if (value !== value.trim()) {
                  return Promise.reject(
                    new Error(t("Name cannot have leading or trailing spaces"))
                  );
                }
              },
            },
          ]}
        >
          <Input maxLength={20} showCount />
        </Form.Item>
        <Form.Item
          label={t("Email")}
          name="email"
          normalize={(value) => value?.toLowerCase()}
          rules={[
            { required: true, message: "" },
            { type: "email", message: t("Must be a valid email") },
            {
              whitespace: true,
              message: t("Cannot be empty"),
            },
            {
              validator: async (_, value) => {
                // Check if value don't have tailing or leading spaces
                if (value !== value.trim()) {
                  return Promise.reject(
                    new Error(t("Cannot have leading or trailing spaces"))
                  );
                }
              },
            },
          ]}
        >
          <Input type="email" maxLength={255} showCount />
        </Form.Item>
        <Form.Item
          label={t("Role")}
          name="role"
          rules={[{ required: true, message: "" }]}
        >
          <Select
            defaultValue={RoleAccessLevels.STAFF}
            options={Object.values(RoleAccessLevels)
              .filter((p: number) => p > role && p !== RoleAccessLevels.ADMIN)
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
                      css={{ width: "50%" }}
                      validateTrigger={["onChange", "onBlur"]}
                      rules={[
                        {
                          required: true,
                          message: t("Position is required"),
                        },
                      ]}
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
                        min={0}
                        placeholder={t("Hourly Wage")}
                        step={0.25}
                        css={{ width: "100%" }}
                      />
                    </Form.Item>
                  </div>
                  <Button
                    css={{ width: 30 }}
                    type="text"
                    shape="circle"
                    onClick={() => remove(name)}
                    icon={<MinusCircleOutlined />}
                    disabled={loading}
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
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveFilled />}
            block
            loading={loading}
          >
            {t("Save")}
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
}

export default CreateEmployee;
