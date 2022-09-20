/** @jsx jsx */
import { jsx } from "@emotion/react";
import { setDoc } from "firebase/firestore";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { getRoleTextByNumber } from "./employee-utils";
import { useLocation } from "@cuttinboard/cuttinboard-library/services";
import { Employee } from "@cuttinboard/cuttinboard-library/models";
import {
  Positions,
  RoleAccessLevels,
} from "@cuttinboard/cuttinboard-library/utils";
import { recordError } from "../../utils/utils";
import {
  AutoComplete,
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
import { matchSorter } from "match-sorter";
import {
  EditFilled,
  MinusCircleOutlined,
  PlusOutlined,
  SaveFilled,
} from "@ant-design/icons";

type EmployeeRoleData = {
  positions?: { position: string; wage: number }[];
  role: RoleAccessLevels;
  mainPosition?: string;
  employeeDataComments?: string;
};

function EmployeeRolePanel({
  employee,
}: {
  employee: Employee & { role: "employee" };
}) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const { getAviablePositions, locationId } = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    []
  );

  const cancelEditing = () => {
    setEditing(false);
    form.resetFields();
  };

  const onSearch = (searchText: string) => {
    const newOptions = matchSorter(Positions, searchText).map((pos) => ({
      label: t(pos),
      value: pos,
    }));
    setOptions(
      searchText && !Boolean(newOptions.length)
        ? [{ label: t("Add {{0}}", { 0: searchText }), value: searchText }]
        : newOptions
    );
  };

  const onFinish = async ({ positions, ...values }: EmployeeRoleData) => {
    setIsSubmitting(true);
    try {
      const dataToAdd = {
        ...values,
        positions: positions.map((pos) => pos.position),
        wagePerPosition: positions.reduce(
          (acc, pos) => ({ ...acc, [pos.position]: pos.wage }),
          {}
        ),
      };
      await setDoc(
        employee.docRef,
        {
          locations: {
            [locationId]: dataToAdd,
          },
        },
        { merge: true }
      );
      message.success(t("Changes saved"));
    } catch (error) {
      recordError(error);
    }
    setEditing(false);
    setIsSubmitting(false);
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
          role: employee.locations[locationId].role,
          positions:
            Object.entries(employee.locations[locationId].wagePerPosition).map(
              ([key, val]) => ({ position: key, wage: val ?? 0 })
            ) ?? [],
          employeeDataComments:
            employee.locations[locationId].employeeDataComments,
          mainPosition: employee.locations[locationId].mainPosition,
        }}
        disabled={!editing || isSubmitting}
        onFinish={onFinish}
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
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "position"]}
                    rules={[{ required: true, message: "" }]}
                  >
                    <AutoComplete
                      options={options}
                      onSearch={onSearch}
                      style={{ width: 200 }}
                      placeholder={t("Position")}
                    />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, "wage"]}>
                    <InputNumber
                      min={0}
                      placeholder={t("Hourly Wage")}
                      step={0.25}
                    />
                  </Form.Item>
                  <Button
                    type="text"
                    shape="circle"
                    onClick={() => remove(name)}
                    icon={<MinusCircleOutlined />}
                    disabled={!editing || isSubmitting}
                  />
                </Space>
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
