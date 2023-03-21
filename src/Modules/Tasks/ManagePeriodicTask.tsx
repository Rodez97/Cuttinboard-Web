/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Row,
  Typography,
} from "antd";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { isEmpty } from "lodash";
import {
  useDisclose,
  useRecurringTasks,
} from "@cuttinboard-solutions/cuttinboard-library";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  IRecurringTask,
  IRecurringTaskDoc,
  RecurrenceObject,
} from "@cuttinboard-solutions/types-helpers";
dayjs.extend(utc);
dayjs.extend(timezone);

export interface ManagePeriodicTaskRef {
  openNew: () => void;
  openEdit: (recurringTask: [string, IRecurringTask]) => void;
}

type FormRecurrenceObject = {
  interval: number;
  unit: "daily" | "weekly" | "monthly";
  startingOn?: dayjs.Dayjs;
  byWeekday?: (0 | 1 | 2 | 3 | 4 | 5 | 6)[];
  onDay?: number;
};

type FormDataType = {
  name: string;
  description?: string;
  recurrence: FormRecurrenceObject;
};

const defaultRecurrence: FormDataType["recurrence"] = {
  interval: 1,
  unit: "daily",
  startingOn: dayjs(),
  byWeekday: [1],
  onDay: 1,
};

const WEEKDAYS = [
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
  { label: "Sunday", value: 0 },
];

export default forwardRef<
  ManagePeriodicTaskRef,
  {
    recurringTaskDoc?: IRecurringTaskDoc;
  }
>(({ recurringTaskDoc }, ref) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<FormDataType>();
  const [isOpen, open, close] = useDisclose(false);
  const [title, setTitle] = useState("");
  const [editing, startEditing, endEditing] = useDisclose();
  const [periodicTask, setPeriodicTask] = useState<
    [string, IRecurringTask] | null
  >(null);
  const { addPeriodicTask, updatePeriodicTask, removePeriodicTask } =
    useRecurringTasks();

  useImperativeHandle(ref, () => ({
    openNew,
    openEdit,
  }));

  const openNew = () => {
    setTitle("Add Periodic Task");
    setPeriodicTask(null);
    form.resetFields();
    startEditing();
    open();
  };

  const openEdit = (recurringTask: [string, IRecurringTask]) => {
    setTitle("Edit Periodic Task");
    setPeriodicTask(recurringTask);
    const { recurrence, name, description } = recurringTask[1];
    const startingOn = recurrence.startingOn
      ? dayjs.unix(recurrence.startingOn)
      : dayjs();

    form.setFieldsValue({
      name,
      description,
      recurrence: {
        ...defaultRecurrence,
        ...recurrence,
        startingOn,
      },
    });
    endEditing();
    open();
  };

  const handleClose = () => {
    close();
  };

  const onFinish = async (values: FormDataType) => {
    const { recurrence } = values;
    const { startingOn, interval, byWeekday, onDay } = recurrence;
    let newRecurrence: RecurrenceObject;
    switch (recurrence.unit) {
      case "daily":
        {
          newRecurrence = {
            interval,
            unit: "daily",
            startingOn: startingOn ? startingOn.unix() : dayjs().unix(),
          };
        }
        break;
      case "weekly":
        {
          newRecurrence = {
            unit: "weekly",
            startingOn: startingOn ? startingOn.unix() : undefined,
            byWeekday: byWeekday ?? [1],
          };
        }
        break;
      case "monthly":
        {
          newRecurrence = {
            unit: "monthly",
            startingOn: startingOn ? startingOn.unix() : undefined,
            onDay: onDay ?? 1,
          };
        }
        break;
      default:
        throw new Error("Invalid unit");
    }
    if (periodicTask && recurringTaskDoc) {
      // Update existing task
      updatePeriodicTask(
        { ...values, recurrence: newRecurrence },
        periodicTask[0]
      );
    } else {
      addPeriodicTask({ ...values, recurrence: newRecurrence });
      message.success("Periodic Task Successfully Created");
    }
    handleClose();
  };

  const handleDelete = () => {
    if (!recurringTaskDoc || !periodicTask) {
      return;
    }
    Modal.confirm({
      title: t("Are you sure you want to delete this task?"),
      icon: <ExclamationCircleOutlined />,
      okText: t("Yes"),
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        removePeriodicTask(periodicTask[0]);
        handleClose();
      },
    });
  };

  const handleCancel = () => {
    if (periodicTask) {
      if (editing) {
        endEditing();
      } else {
        handleClose();
      }
    } else {
      handleClose();
    }
  };

  const handleAccept = () => {
    if (editing) {
      form.submit();
    } else {
      startEditing();
    }
  };

  return (
    <Modal
      open={isOpen}
      title={t(title)}
      onCancel={handleClose}
      footer={[
        <Button onClick={handleCancel} key="cancel">
          {t("Cancel")}
        </Button>,
        !isEmpty(periodicTask) && (
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            key="delete"
          >
            {t("Delete")}
          </Button>
        ),
        <Button
          type="primary"
          icon={editing ? <SaveOutlined /> : <EditOutlined />}
          onClick={handleAccept}
          key="accept"
        >
          {t(editing ? "Save" : "Edit")}
        </Button>,
      ]}
    >
      <Form<FormDataType>
        form={form}
        onFinish={onFinish}
        disabled={!editing}
        autoComplete="off"
        layout="vertical"
        size="small"
        initialValues={{
          recurrence: defaultRecurrence,
        }}
      >
        <Form.Item
          name="name"
          label={t("Title")}
          required
          rules={[
            { required: true, message: "" },
            {
              whitespace: true,
              message: t("Cannot be empty"),
            },
            // Check if value don't have tailing or leading spaces
            {
              validator: (_, value) => {
                if (value && value.trim() !== value) {
                  return Promise.reject(
                    new Error(t("Cannot have leading or trailing spaces"))
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input maxLength={80} showCount placeholder={t("Clean trash cans")} />
        </Form.Item>
        <Form.Item
          name="description"
          label={t("Description")}
          rules={[
            // Check if value don't have tailing or leading spaces
            {
              validator: (_, value) => {
                if (value && value.trim() !== value) {
                  return Promise.reject(
                    new Error(t("Cannot have leading or trailing spaces"))
                  );
                }
                return Promise.resolve();
              },
            },
            {
              max: 255,
              message: t("Max 255 characters"),
            },
            {
              whitespace: true,
              message: t("Cannot be empty"),
            },
          ]}
        >
          <Input.TextArea maxLength={255} showCount rows={3} />
        </Form.Item>
        <Divider orientation="left">{t("Recurrence")}</Divider>
        <Form.Item
          name={["recurrence", "unit"]}
          rules={[
            {
              required: true,
              message: "",
            },
          ]}
        >
          <Radio.Group buttonStyle="outline" size="middle">
            <Radio value={"daily"}>{t("Daily")}</Radio>
            <Radio value={"weekly"}>{t("Weekly")}</Radio>
            <Radio value={"monthly"}>{t("Monthly")}</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item shouldUpdate>
          {() => {
            const { recurrence } = form.getFieldsValue();

            if (recurrence?.unit === "weekly") {
              return (
                <Form.Item
                  name={["recurrence", "byWeekday"]}
                  label={t("Repeat every week on:")}
                  required
                  rules={[
                    {
                      required: true,
                      message: "",
                    },
                  ]}
                >
                  <Checkbox.Group>
                    <Row>
                      {WEEKDAYS.map((wd, i) => (
                        <Col xs={12} sm={8} md={6} key={i}>
                          <Checkbox value={wd.value}>{t(wd.label)}</Checkbox>
                        </Col>
                      ))}
                    </Row>
                  </Checkbox.Group>
                </Form.Item>
              );
            } else if (recurrence?.unit === "daily") {
              return (
                <React.Fragment>
                  <Form.Item>
                    <div
                      css={{
                        display: "flex",
                        gap: 5,
                        alignItems: "baseline",
                      }}
                    >
                      <Typography.Text>{t("Repeat every")}</Typography.Text>
                      <Form.Item
                        name={["recurrence", "interval"]}
                        rules={[
                          {
                            required: true,
                            message: "",
                          },
                        ]}
                        css={{
                          marginBottom: 0,
                        }}
                      >
                        <InputNumber min={1} css={{ width: 60 }} />
                      </Form.Item>
                      <Typography.Text>{t("day(s)")}</Typography.Text>
                    </div>
                  </Form.Item>
                  <Form.Item
                    name={["recurrence", "startingOn"]}
                    label={t("Starting on")}
                    rules={[
                      {
                        required: true,
                        message: "",
                      },
                    ]}
                  >
                    <DatePicker
                      format="DD/MM/YYYY"
                      placeholder={t("Select date")}
                      showToday
                    />
                  </Form.Item>
                </React.Fragment>
              );
            } else if (recurrence?.unit === "monthly") {
              return (
                <div css={{ display: "flex", gap: 5 }}>
                  <Typography.Text>{t("On day")}</Typography.Text>
                  <Form.Item
                    name={["recurrence", "onDay"]}
                    rules={[
                      {
                        required: true,
                        message: "",
                      },
                    ]}
                  >
                    <InputNumber min={1} max={28} css={{ width: 60 }} />
                  </Form.Item>
                  <Typography.Text>{t("of every month.")}</Typography.Text>
                </div>
              );
            }
          }}
        </Form.Item>
      </Form>
    </Modal>
  );
});
