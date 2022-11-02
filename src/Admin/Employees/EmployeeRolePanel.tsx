/** @jsx jsx */
import { jsx } from "@emotion/react";
import { setDoc } from "firebase/firestore";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { getRoleTextByNumber } from "./employee-utils";
import { useLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/models";
import {
  Positions,
  RoleAccessLevels,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { recordError } from "../../utils/utils";
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Space,
  Typography,
} from "antd";
import {
  EditFilled,
  MinusCircleOutlined,
  PlusOutlined,
  SaveFilled,
} from "@ant-design/icons";
import { compact } from "lodash";
import { getAnalytics, logEvent } from "firebase/analytics";

type EmployeeRoleData = {
  positions?: { position: string; wage: number }[];
  role: RoleAccessLevels;
  mainPosition?: string;
  employeeDataComments?: string;
};

function EmployeeRolePanel({ employee }: { employee: Employee }) {
  const { t } = useTranslation();
  const [form] = Form.useForm<EmployeeRoleData>();
  const positions = Form.useWatch("positions", form);
  const [editing, setEditing] = useState(false);
  const { getAviablePositions, location } = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cancelEditing = () => {
    setEditing(false);
    form.resetFields();
  };

  const onFinish = async ({ positions, ...values }: EmployeeRoleData) => {
    setIsSubmitting(true);
    try {
      const dataToAdd = {
        ...values,
        pos: positions.map((pos) => pos.position),
        wagePerPosition: positions.reduce(
          (acc, pos) => ({ ...acc, [pos.position]: pos.wage }),
          {}
        ),
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
    }
    setEditing(false);
    setIsSubmitting(false);
  };

  const getPositions = () => {
    return employee.positions?.map((pos) => {
      return {
        position: pos,
        wage: employee.getHourlyWage(pos),
      };
    });
  };

  return (
    <Card
      title={t("Role, Positions & Hourly Wages")}
      css={{
        minWidth: 300,
        maxWidth: 500,
        margin: "auto",
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
        disabled={!editing || isSubmitting}
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
            options={getAviablePositions
              .filter((p) => p !== RoleAccessLevels.ADMIN)
              .map((role) => ({
                label: t(getRoleTextByNumber(role)),
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
                    disabled={!editing || isSubmitting}
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
        {positions?.length > 0 && (
          <Form.Item label={t("Main Position")} name="mainPosition">
            <Select
              options={compact(
                positions?.map((pos) =>
                  pos?.position
                    ? {
                        label: pos.position,
                        value: pos.position,
                      }
                    : null
                )
              )}
            />
          </Form.Item>
        )}
        <Form.Item label={t("Comments")} name="employeeDataComments">
          <Input.TextArea rows={2} maxLength={255} showCount />
        </Form.Item>
      </Form>
      <Space
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        {editing && (
          <Button onClick={cancelEditing} disabled={isSubmitting}>
            {t("Cancel")}
          </Button>
        )}
        {editing ? (
          <Button
            icon={<SaveFilled />}
            loading={isSubmitting}
            onClick={form.submit}
            type="primary"
          >
            {t("Save")}
          </Button>
        ) : (
          <Button
            icon={<EditFilled />}
            loading={isSubmitting}
            onClick={() => setEditing(true)}
            type="link"
            disabled={false}
          >
            {t("Edit")}
          </Button>
        )}
      </Space>
    </Card>
  );
}

export default EmployeeRolePanel;
