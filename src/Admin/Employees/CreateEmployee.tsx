/** @jsx jsx */
import { jsx } from "@emotion/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";
import {
  Alert,
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
import { collection, getDocs, query, where } from "firebase/firestore";
import { compact } from "lodash";
import { getAnalytics, logEvent } from "firebase/analytics";
import {
  FIRESTORE,
  POSITIONS,
  RoleAccessLevels,
  roleToString,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import {
  useEmployeeCreator,
  useEmployeesList,
} from "@cuttinboard-solutions/cuttinboard-library/employee";
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library/services";

type EmployeeData = {
  name: string;
  lastName: string;
  email: string;
  positions?: { position: string; wage: number }[];
  role: RoleAccessLevels;
};

/**
 * Form for creating a new employee.
 */
function CreateEmployee(props: DrawerProps) {
  const [form] = Form.useForm<EmployeeData>();
  const { getEmployees } = useEmployeesList();
  const { availablePositions, location } = useCuttinboardLocation();
  const { t } = useTranslation();
  const { createEmployee, loading, error } = useEmployeeCreator();

  const onFinish = async ({ positions, ...values }: EmployeeData) => {
    if (getEmployees.some((e) => e.email === values.email)) {
      message.warning(t("Employee already exists"));
      return;
    }
    if (location.usage.employeesCount >= location.usage.employeesLimit) {
      message.warning(t("Limit Reached"));
      return;
    }
    try {
      const checkForSupervisor = await getDocs(
        query(
          collection(
            FIRESTORE,
            "Organizations",
            location.organizationId,
            "employees"
          ),
          where("email", "==", values.email),
          where("role", "in", [0, 1])
        )
      );
      if (checkForSupervisor.size === 1) {
        message.error(
          t("This user is already an owner or supervisor in the organization")
        );
        return;
      }

      const employeeToAdd = {
        ...values,
        positions: positions ? positions.map((pos) => pos.position) : [],
        wagePerPosition: positions
          ? positions.reduce(
              (acc, pos) => ({ ...acc, [pos.position]: pos.wage }),
              {}
            )
          : {},
        mainPosition: "",
      };

      const result = await createEmployee({
        ...employeeToAdd,
        locationId: location.id,
      });

      if (!result || !result.data) {
        message.error(
          t("There was an error creating the employee. Please try again")
        );
        return;
      }

      const { status, employeeId } = result.data;

      if (status === "CANT_ADD_ORG_EMP") {
        message.error(
          t("This user is already an owner or supervisor in the organization")
        );
        return;
      }

      if (status === "CREATED") {
        message.success(
          t(
            "An account has been created and a temporary password has been emailed to this user"
          )
        );
        // Report to analytics
        logEvent(getAnalytics(), "employee_created", {
          employeeId,
          locationId: location.id,
        });
      }
      if (["ADDED", "ALREADY_MEMBER"].includes(status)) {
        message.success(t("Employee added"));
        // Report to analytics
        logEvent(getAnalytics(), "employee_added", {
          employeeId,
          locationId: location.id,
        });
      }
      form.resetFields();
    } catch (error) {
      recordError(error);
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
            options={availablePositions
              .filter((p) => p !== RoleAccessLevels.ADMIN)
              .map((role) => ({
                label: t(roleToString(role)),
                value: role,
              }))}
          />
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

        {error && <Alert message={error?.message} type="error" showIcon />}
      </Form>
    </Drawer>
  );
}

export default CreateEmployee;
