/** @jsx jsx */
import { jsx } from "@emotion/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getRoleTextByNumber } from "./employee-utils";
import { recordError } from "../../utils/utils";
import {
  useEmployeesList,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  Positions,
  RoleAccessLevels,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import {
  Alert,
  Button,
  Form,
  Input,
  InputNumber,
  Layout,
  message,
  PageHeader,
  Select,
} from "antd";
import {
  MinusCircleOutlined,
  PlusOutlined,
  SaveFilled,
} from "@ant-design/icons";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import { Functions } from "@cuttinboard-solutions/cuttinboard-library/firebase";

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
function CreateEmployee() {
  const navigate = useNavigate();
  const { getEmployees } = useEmployeesList();
  const { getAviablePositions, location } = useLocation();
  const { t } = useTranslation();

  const [addEmployee, submitting, error] = useHttpsCallable<
    {
      name: string;
      lastName: string;
      email: string;
      role: RoleAccessLevels | "employee";
      positions: string[];
      wagePerPosition: {};
      mainPosition: string;
      locationId: string;
    },
    {
      status: "ADDED" | "CREATED" | "ALREADY_MEMBER" | "CANT_ADD_ORG_EMP";
      employeeId: string;
    }
  >(Functions, "http-employees-create");

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
      const employeeToAdd = {
        ...values,
        positions: positions.map((pos) => pos.position),
        wagePerPosition: positions.reduce(
          (acc, pos) => ({ ...acc, [pos.position]: pos.wage }),
          {}
        ),
        mainPosition: "",
      };

      const {
        data: { status, employeeId },
      } = await addEmployee({ ...employeeToAdd, locationId: location.id });

      if (status === "CANT_ADD_ORG_EMP") {
        message.error(t("The employee is already member of the organization"));
        navigate(-1);
        return;
      }

      if (status === "CREATED") {
        message.success(
          t(
            "An account has been created and a temporary password has been emailed to this user"
          )
        );
      }
      if (["ADDED", "ALREADY_MEMBER"].includes(status)) {
        message.success(t("Changes saved"));
      }
      navigate(`/location/${location.id}/apps/employees/${employeeId}`);
    } catch (error) {
      recordError(error);
    }
  };

  return (
    <Layout style={{ overflow: "auto" }}>
      <PageHeader
        className="site-page-header-responsive"
        onBack={() => navigate(-1)}
        title={t("Add Employee")}
      />

      <Form<EmployeeData>
        css={{ width: 300, alignSelf: "center" }}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          name: "",
          lastName: "",
          email: "",
          role: RoleAccessLevels.STAFF,
          positions: [],
        }}
        disabled={submitting}
      >
        <Form.Item
          required
          label={t("Name")}
          name="name"
          rules={[{ required: true, message: "" }]}
        >
          <Input maxLength={50} showCount />
        </Form.Item>
        <Form.Item
          required
          label={t("Last Name")}
          name="lastName"
          rules={[{ required: true, message: "" }]}
        >
          <Input maxLength={50} showCount />
        </Form.Item>
        <Form.Item
          label={t("Email")}
          name="email"
          rules={[
            { required: true, message: "" },
            { type: "email", message: t("Must be a valid email") },
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
            options={getAviablePositions
              .filter((p) => p !== RoleAccessLevels.ADMIN)
              .map((role) => ({
                label: t(getRoleTextByNumber(role)),
                value: role,
              }))}
          />
        </Form.Item>
        <Form.List
          name="positions"
          rules={[
            {
              validator: async (_, positions) => {
                if (positions && positions.length >= 10) {
                  return Promise.reject(
                    new Error(t("Can't add more than 10 positions"))
                  );
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }) => (
            <React.Fragment>
              {fields.map(({ key, name, ...restField }) => (
                <div
                  key={key}
                  css={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 1,
                    marginBottom: 8,
                  }}
                >
                  <Form.Item
                    {...restField}
                    name={[name, "position"]}
                    rules={[{ required: true, message: "" }]}
                    css={{ flex: 0.45 }}
                  >
                    <Select showSearch placeholder={t("Position")}>
                      {location.settings?.positions?.length && (
                        <Select.OptGroup label={t("Custom")}>
                          {location.settings.positions.map((pos) => (
                            <Select.Option value={pos}>{pos}</Select.Option>
                          ))}
                        </Select.OptGroup>
                      )}

                      <Select.OptGroup label={t("Default")}>
                        {Positions.map((pos) => (
                          <Select.Option value={pos}>{pos}</Select.Option>
                        ))}
                      </Select.OptGroup>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "wage"]}
                    css={{ flex: 0.45 }}
                  >
                    <InputNumber
                      min={0}
                      placeholder={t("Hourly Wage")}
                      step={0.25}
                    />
                  </Form.Item>
                  <Button
                    css={{ flex: 0.1 }}
                    type="text"
                    shape="circle"
                    onClick={() => remove(name)}
                    icon={<MinusCircleOutlined />}
                    disabled={submitting}
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
            </React.Fragment>
          )}
        </Form.List>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveFilled />}
            block
            loading={submitting}
          >
            {t("Save")}
          </Button>
        </Form.Item>

        {error && <Alert message={error?.message} type="error" showIcon />}
      </Form>
    </Layout>
  );
}

export default CreateEmployee;
