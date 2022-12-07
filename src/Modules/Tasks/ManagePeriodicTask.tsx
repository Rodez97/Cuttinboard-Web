/** @jsx jsx */
import { jsx } from "@emotion/react";
import { DeleteOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Space,
  Typography,
} from "antd";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";
import moment from "moment";
import dayjsRecur from "dayjs-recur";
import dayjs from "dayjs";
import { nanoid } from "nanoid";
import { ByWeekday, Frequency, RRule } from "rrule";
import { isEmpty } from "lodash";
import {
  RecurrenceObject,
  RecurringTask,
  RecurringTaskDoc,
} from "@cuttinboard-solutions/cuttinboard-library/checklist";
import {
  useCuttinboard,
  useCuttinboardLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  FIRESTORE,
  useDisclose,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
dayjs.extend(dayjsRecur);

export interface ManagePeriodicTaskRef {
  openNew: () => void;
  openEdit: (recurringTask: [string, RecurringTask]) => void;
}

type FormRecurrenceObject = {
  every: number;
  unit: Frequency;
  startingOn?: moment.Moment;
  weekDays?: ByWeekday[];
  onDay?: number;
  dailyType: "every" | "weekDays";
};

type FormDataType = {
  name: string;
  description?: string;
  recurrence: FormRecurrenceObject;
};

const defaultRecurrence: FormDataType["recurrence"] = {
  every: 1,
  unit: Frequency.DAILY,
  startingOn: moment(),
  weekDays: [RRule.MO],
  onDay: 1,
  dailyType: "every",
};

const WEEKDAYS = [
  { label: "Monday", value: RRule.MO.weekday },
  { label: "Tuesday", value: RRule.TU.weekday },
  { label: "Wednesday", value: RRule.WE.weekday },
  { label: "Thursday", value: RRule.TH.weekday },
  { label: "Friday", value: RRule.FR.weekday },
  { label: "Saturday", value: RRule.SA.weekday },
  { label: "Sunday", value: RRule.SU.weekday },
];

export default forwardRef<
  ManagePeriodicTaskRef,
  {
    recurringTaskDoc?: RecurringTaskDoc;
  }
>(({ recurringTaskDoc }, ref) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<FormDataType>();
  const { user } = useCuttinboard();
  const { location } = useCuttinboardLocation();
  const [isOpen, open, close] = useDisclose(false);
  const [title, setTitle] = useState("");
  const [isSubmitting, startSubmit, endSubmit] = useDisclose();
  const [editing, startEditing, endEditing] = useDisclose();
  const [periodicTask, setPeriodicTask] = useState<
    [string, RecurringTask] | null
  >(null);

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

  const openEdit = (recurringTask: [string, RecurringTask]) => {
    setTitle("Edit Periodic Task");
    setPeriodicTask(recurringTask);
    const recurrenceObject = RecurringTask.getRRuleObjectFromRule(
      recurringTask[1].recurrenceRule
    );
    console.log({ recurrenceObject });

    form.setFieldsValue({
      name: recurringTask[1].name,
      description: recurringTask[1].description,
      recurrence: {
        ...defaultRecurrence,
        ...recurrenceObject,
        startingOn: moment(recurrenceObject.startingOn),
      },
    });
    endEditing();
    open();
  };

  const handleClose = () => {
    close();
  };

  const onFinish = async (values: FormDataType) => {
    startSubmit();
    // Convert recurrence startOn to a date
    const { recurrence } = values;
    const { startingOn } = recurrence;
    const newRecurrence: RecurrenceObject = {
      ...recurrence,
      startingOn: startingOn ? startingOn.toDate() : new Date(),
    };
    const newRRule = RecurringTask.getRRuleFromObject(newRecurrence);
    const ruleString = newRRule.toString();

    try {
      if (periodicTask && recurringTaskDoc) {
        // Update existing task
        await recurringTaskDoc.updatePeriodicTask(
          { ...values, recurrence: ruleString },
          periodicTask[0]
        );
      } else if (recurringTaskDoc) {
        await recurringTaskDoc.addPeriodicTask(
          { ...values, recurrence: ruleString },
          nanoid()
        );
      } else {
        await setDoc(
          doc(
            FIRESTORE,
            "Organizations",
            location.organizationId,
            "recurringTasks",
            location.id
          ),
          {
            tasks: {
              [nanoid()]: {
                ...values,
                recurrence: ruleString,
              },
            },
            createdAt: serverTimestamp(),
            createdBy: user.uid,
          },
          { merge: true }
        );
      }

      endSubmit();
      handleClose();
    } catch (error) {
      recordError(error);
      endSubmit();
    }
  };

  const handleDelete = async () => {
    if (!recurringTaskDoc || !periodicTask) {
      return;
    }
    startSubmit();
    const confirm = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (confirm) {
      try {
        await recurringTaskDoc.removePeriodicTask(periodicTask[0]);
        endSubmit();
        handleClose();
      } catch (error) {
        recordError(error);
        endSubmit();
      }
    } else {
      endSubmit();
    }
  };

  const handleCancel = () => {
    if (editing) {
      endEditing();
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
      confirmLoading={isSubmitting}
      footer={[
        <Button disabled={isSubmitting} onClick={handleCancel} key="cancel">
          {t("Cancel")}
        </Button>,
        !isEmpty(periodicTask) && (
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            loading={isSubmitting}
            onClick={handleDelete}
            key="delete"
          >
            {t("Delete")}
          </Button>
        ),
        <Button
          type="primary"
          icon={editing ? <SaveOutlined /> : <EditOutlined />}
          loading={isSubmitting}
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
        disabled={isSubmitting || !editing}
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
          <Input maxLength={80} showCount />
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
            <Radio value={Frequency.DAILY}>{t("Daily")}</Radio>
            <Radio value={Frequency.WEEKLY}>{t("Weekly")}</Radio>
            <Radio value={Frequency.MONTHLY}>{t("Monthly")}</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item shouldUpdate>
          {() => {
            const { recurrence } = form.getFieldsValue();

            if (recurrence?.unit === Frequency.WEEKLY) {
              return (
                <React.Fragment>
                  <div css={{ display: "flex", gap: 5 }}>
                    <Typography.Text>{t("Repeat every")}</Typography.Text>
                    <Form.Item
                      name={["recurrence", "every"]}
                      required
                      rules={[
                        {
                          required: true,
                          message: "",
                        },
                      ]}
                    >
                      <InputNumber min={1} max={4} css={{ width: 60 }} />
                    </Form.Item>
                    <Typography.Text>{t("week(s)")}</Typography.Text>
                  </div>

                  <Form.Item
                    name={["recurrence", "weekDays"]}
                    label={t("Week days")}
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
                </React.Fragment>
              );
            } else if (recurrence?.unit === Frequency.DAILY) {
              return (
                <React.Fragment>
                  <Form.Item
                    name={["recurrence", "dailyType"]}
                    rules={[
                      {
                        required: true,
                        message: "",
                      },
                    ]}
                  >
                    <Radio.Group size="middle">
                      <Space direction="vertical">
                        <Radio value="every">
                          <div css={{ display: "flex", gap: 5 }}>
                            <Typography.Text>
                              {t("Repeat every")}
                            </Typography.Text>
                            <Form.Item
                              name={["recurrence", "every"]}
                              rules={[
                                {
                                  required: true,
                                  message: "",
                                },
                              ]}
                            >
                              <InputNumber min={1} css={{ width: 60 }} />
                            </Form.Item>
                            <Typography.Text>{t("day(s)")}</Typography.Text>
                          </div>
                        </Radio>
                        <Radio value="weekDays">{t("Every weekday")}</Radio>
                      </Space>
                    </Radio.Group>
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
            } else if (recurrence?.unit === Frequency.MONTHLY) {
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
                  <Typography.Text>{t("of every")}</Typography.Text>
                  <Form.Item
                    name={["recurrence", "every"]}
                    rules={[
                      {
                        required: true,
                        message: "",
                      },
                    ]}
                  >
                    <InputNumber min={1} max={12} css={{ width: 60 }} />
                  </Form.Item>
                  <Typography.Text>{t("month(s)")}</Typography.Text>
                </div>
              );
            }
          }}
        </Form.Item>
      </Form>
    </Modal>
  );
});
