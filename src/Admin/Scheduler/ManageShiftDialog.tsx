/** @jsx jsx */
import { jsx } from "@emotion/react";
import dayjs from "dayjs";
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { nanoid } from "nanoid";
import { useTranslation } from "react-i18next";
import isoWeek from "dayjs/plugin/isoWeek";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import duration from "dayjs/plugin/duration";
import {
  Employee,
  IShift,
  Shift,
  Todo_Task,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { useSchedule } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Tag,
  TimePicker,
  Typography,
} from "antd";
import moment from "moment";
import TextArea from "antd/lib/input/TextArea";
import {
  ExclamationCircleOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { recordError } from "../../utils/utils";
import { serverTimestamp } from "firebase/firestore";
import { isEmpty } from "lodash";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(duration);

export interface IManageShiftDialogRef {
  openNew: (employee: Employee, column: Date) => void;
  openEdit: (employee: Employee, shift: Shift) => void;
}

type FormDataType = {
  applyTo: number[];
  notes?: string;
  position?: string;
  tasks?: string[];
  timeRange: { start: moment.Moment; end: moment.Moment };
};

const ManageShiftDialog = forwardRef<IManageShiftDialogRef, {}>((_, ref) => {
  const [form] = Form.useForm<FormDataType>();
  const [saving, setSaving] = useState(false);
  const {
    createShift,
    weekDays,
    employeeShiftsCollection,
    scheduleSettingsData,
  } = useSchedule();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const baseShift = useRef<Shift>(null);
  const baseDate = useRef<Date>(null);
  const baseEmployee = useRef<Employee>(null);

  useImperativeHandle(ref, () => ({
    openNew,
    openEdit,
  }));

  const openNew = (employee: Employee, date: Date) => {
    const weekDay = dayjs(date).isoWeekday();
    const position =
      employee.role === "employee"
        ? employee.mainPosition ?? employee.positions[0]
        : null;
    baseEmployee.current = employee;
    baseDate.current = date;
    form.setFieldsValue({
      applyTo: [weekDay],
      timeRange: {
        start: moment(date).add(8, "hours"),
        end: moment(date).add(16, "hours"),
      },
      position,
    });
    setOpen(true);
  };

  const openEdit = (employee: Employee, shift: Shift) => {
    baseEmployee.current = employee;
    baseShift.current = shift;
    const shiftData = shift.hasPendingUpdates ? shift.pendingUpdate : shift;
    // get the date of the shift
    const startDate = Shift.toDate(shiftData.start);
    baseDate.current = startDate.toDate();
    form.setFieldsValue({
      applyTo: [startDate.isoWeekday()],
      notes: shiftData.notes ?? "",
      position: shiftData.position ?? "",
      tasks: Object.values(shiftData.tasks ?? {}).map((tsk) => tsk.name),
      timeRange: {
        start: moment(startDate.toDate()),
        end: moment(Shift.toDate(shiftData.end).toDate()),
      },
    });
    setOpen(true);
  };

  const handleClose = () => {
    // Reset form, state and close dialog
    setOpen(false);
    baseShift.current = null;
    baseDate.current = null;
    baseEmployee.current = null;
    form.resetFields();
  };

  const onFinish = async (values: FormDataType) => {
    const { applyTo, notes, position, tasks, timeRange } = values;

    const hourlyWage = baseEmployee.current?.getHourlyWage(position) ?? 0;

    const shiftToSave: Partial<IShift> = {
      start: Shift.toString(timeRange.start.toDate()),
      end: Shift.toString(timeRange.end.toDate()),
      notes,
      position,
      hourlyWage,
    };

    setSaving(true);
    try {
      if (!baseShift.current) {
        const transformedTasks = tasks?.reduce<Record<string, Todo_Task>>(
          (acc, task, index) => {
            return {
              ...acc,
              [index]: {
                name: task,
                status: false,
                createdAt: serverTimestamp(),
              },
            };
          },
          {}
        );
        await createShift(
          { ...shiftToSave, tasks: transformedTasks } as IShift,
          weekDays,
          applyTo,
          nanoid(),
          baseEmployee.current?.id
        );
      } else {
        const transformedTasks = tasks?.reduce<Record<string, Todo_Task>>(
          (acc, task, index) => {
            return {
              ...acc,
              [index]: {
                status: false,
                createdAt: serverTimestamp(),
                ...acc[index],
                name: task,
              },
            };
          },
          baseShift.current.tasks ?? {}
        );
        await baseShift.current.editShift({
          ...shiftToSave,
          tasks: transformedTasks,
        });
      }
      handleClose();
    } catch (error) {
      recordError(error);
    }
    setSaving(false);
  };

  const cancelPendingUpdate = async () => {
    Modal.confirm({
      title: t("Are you sure to cancel this update?"),
      content: t("The shift will be restored to the previous state"),
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        try {
          await baseShift.current.cancelUpdate();
          handleClose();
        } catch (error) {
          recordError(error);
        }
      },
      onCancel() {},
    });
  };

  // Get Employee shifts
  const shiftsDoc = useMemo(() => {
    if (!baseEmployee.current) {
      return null;
    }
    return employeeShiftsCollection.find(
      (shift) => shift.employeeId === baseEmployee.current?.id
    );
  }, [baseEmployee.current, employeeShiftsCollection]);

  if (!form) {
    return null;
  }

  return (
    <Modal
      open={open}
      zIndex={1000}
      onCancel={handleClose}
      title={t(!baseShift.current ? "Add Shift" : "Edit Shift")}
      footer={[
        baseShift.current?.pendingUpdate && (
          <Button
            key="reset"
            danger
            type="dashed"
            disabled={saving}
            onClick={cancelPendingUpdate}
          >
            {t("Cancel Update")}
          </Button>
        ),
        <Button key="back" onClick={handleClose} disabled={saving}>
          {t("Cancel")}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={saving}
          onClick={form.submit}
        >
          {t("Accept")}
        </Button>,
      ]}
    >
      <Form<FormDataType>
        form={form}
        onFinish={onFinish}
        disabled={saving}
        size="small"
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          name="timeRange"
          dependencies={[
            ["timeRange", "start"],
            ["timeRange", "end"],
            "applyTo",
          ]}
          rules={[
            {
              validator: async (_, value: FormDataType["timeRange"]) => {
                if (!value) {
                  return Promise.reject(t("Please select a time range"));
                }

                const applyTo: FormDataType["applyTo"] =
                  form.getFieldValue("applyTo");

                const { start, end } = value;

                // Convert to dayjs
                const startDayjs = dayjs(start.toDate());
                const endDayjs = dayjs(end.toDate());

                for (const day of applyTo) {
                  const weekDay = weekDays.find(
                    (wd) => dayjs(wd).isoWeekday() === day
                  );
                  if (!weekDay) {
                    return Promise.reject(t("Invalid day"));
                  }
                  const start = dayjs(weekDay)
                    .set("hour", startDayjs.hour())
                    .set("minute", startDayjs.minute());
                  const end = dayjs(weekDay)
                    .set("hour", endDayjs.hour())
                    .set("minute", endDayjs.minute());
                  // Check if overlaps
                  const shiftOverlaps = shiftsDoc?.checkForOverlappingShifts(
                    start,
                    end,
                    baseShift.current?.id ?? ""
                  );

                  if (shiftOverlaps) {
                    return Promise.reject(
                      t(
                        "This shift overlaps with another shift for this employee"
                      )
                    );
                  }
                }

                return Promise.resolve();
              },
            },
          ]}
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
              name={["timeRange", "start"]}
              css={{ width: "100%" }}
              trigger="onSelect"
              rules={[{ required: true, message: "" }]}
              required
              help={t("Start time of the shift")}
              normalize={(
                value: FormDataType["timeRange"]["start"],
                _,
                all: FormDataType
              ) => {
                // If end time is before start time, add a day to the end time
                if (all?.timeRange?.end?.isBefore(value)) {
                  form.setFieldsValue({
                    timeRange: {
                      ...all.timeRange,
                      end: all.timeRange.end.add(1, "day"),
                    },
                  });
                }
                return value;
              }}
            >
              <TimePicker
                allowClear={false}
                placeholder={t("Start")}
                minuteStep={5}
                format="hh:mm a"
                use12Hours
                css={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item<FormDataType["timeRange"]>
              name={["timeRange", "end"]}
              css={{ width: "100%" }}
              trigger="onSelect"
              rules={[{ required: true, message: "" }]}
              required
              help={t("End time of the shift")}
              normalize={(
                value: FormDataType["timeRange"]["end"],
                _,
                all: FormDataType
              ) => {
                // If end time is before start time, add a day to the end time
                const end = value?.isBefore(all?.timeRange?.start)
                  ? value?.add(1, "day")
                  : value;
                return end;
              }}
            >
              <TimePicker
                allowClear={false}
                placeholder={t("End")}
                minuteStep={5}
                format="hh:mm a"
                use12Hours
                css={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              css={{ width: 230, textAlign: "center" }}
              shouldUpdate={(
                prevValues: FormDataType,
                curValues: FormDataType
              ) =>
                // Only update if the time range changes
                prevValues.timeRange !== curValues.timeRange
              }
            >
              {({ getFieldValue }) => {
                const timeRange = getFieldValue("timeRange");
                if (isEmpty(timeRange) || !timeRange.start || !timeRange.end) {
                  return null;
                }
                const start = dayjs(timeRange?.start?.toDate());
                const end = dayjs(timeRange?.end?.toDate());
                const duration = dayjs
                  .duration(end.diff(start))
                  .format("[🕘] HH[h] mm[min]");

                return (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {duration}
                  </Typography.Text>
                );
              }}
            </Form.Item>
          </div>

          {/**
           * Quick add buttons
           */}
          {scheduleSettingsData?.presetTimes?.length > 0 && (
            <Form.Item css={{ marginTop: 20 }}>
              <Space wrap>
                {scheduleSettingsData.presetTimes.map((presetTime, index) => {
                  const startTime = dayjs(presetTime.start, "HH:mm");
                  const endTime = dayjs(presetTime.end, "HH:mm");
                  // create moment objects for the start and end times based on the current date
                  const startMoment = dayjs(baseDate.current)
                    .set("hour", startTime.hour())
                    .set("minute", startTime.minute());
                  const endMoment = dayjs(baseDate.current)
                    .set("hour", endTime.hour())
                    .set("minute", endTime.minute());
                  // If the end time is before the start time, add a day to the end time
                  if (endMoment.isBefore(startMoment)) {
                    endMoment.add(1, "day");
                  }
                  // Create a string for the button label based on the preset times as 12 hour time (e.g. 9:00 AM - 5:00 PM)
                  const label = `${startTime.format(
                    "h:mm A"
                  )} - ${endTime.format("h:mm A")}`;

                  return (
                    <Button
                      key={index}
                      type="dashed"
                      onClick={() => {
                        form.setFieldsValue({
                          ...form.getFieldsValue(),
                          timeRange: {
                            start: startMoment,
                            end: endMoment,
                          },
                        });
                      }}
                    >
                      {label}
                    </Button>
                  );
                })}
              </Space>
            </Form.Item>
          )}
        </Form.Item>

        <Divider />

        {!baseShift.current && (
          <Form.Item label={t("Apply to:")} name="applyTo">
            <Checkbox.Group>
              <Row>
                {weekDays.map((wd, i) => (
                  <Col xs={12} sm={8} md={6} key={i}>
                    <Checkbox
                      value={dayjs(wd).isoWeekday()}
                      disabled={Boolean(
                        dayjs(wd).isoWeekday() ===
                          dayjs(baseDate.current).isoWeekday()
                      )}
                    >
                      {dayjs(wd).format("dddd")}
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
        )}

        {baseEmployee.current?.role === "employee" && (
          <React.Fragment>
            <Form.Item name="position">
              <Select placeholder={t("Select Position")}>
                <Select.Option value="">{t("No Position")}</Select.Option>
                {baseEmployee.current?.positions.map((position) => {
                  const isMainPos =
                    baseEmployee.current?.mainPosition === position;
                  return (
                    <Select.Option
                      key={position}
                      value={position}
                      style={{
                        backgroundColor: isMainPos && Colors.Yellow.Light,
                      }}
                    >
                      {t(position)}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
            <Form.Item
              shouldUpdate={(
                prevValues: FormDataType,
                curValues: FormDataType
              ) =>
                // Only update if the position changes
                prevValues.position !== curValues.position
              }
            >
              {() => {
                const position: FormDataType["position"] = form.getFieldValue([
                  "position",
                ]);
                const hWage =
                  baseEmployee.current?.getHourlyWage(position) ?? 0;
                return (
                  <div
                    css={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 8,
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography.Text>{t("Hourly Wage")}:</Typography.Text>
                    <Tag color={hWage > 0 ? "processing" : "error"}>
                      {hWage.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      }) + "/hr"}
                    </Tag>
                  </div>
                );
              }}
            </Form.Item>

            <Divider />
          </React.Fragment>
        )}

        <Form.Item name="notes">
          <TextArea
            placeholder={t("Notes")}
            showCount
            maxLength={500}
            rows={2}
          />
        </Form.Item>

        <Form.List name="tasks">
          {(fields, { add, remove }, { errors }) => (
            <React.Fragment>
              {fields.map(({ key, ...field }) => (
                <Form.Item key={key} required={false}>
                  <Form.Item
                    {...field}
                    validateTrigger={["onChange", "onBlur"]}
                    rules={[
                      { max: 150, message: "" },
                      {
                        required: true,
                        message: "Please input a task or delete this field.",
                      },
                    ]}
                    key={key}
                    noStyle
                  >
                    <Input
                      autoFocus
                      placeholder={t("Add task")}
                      addonAfter={
                        <MinusCircleOutlined
                          onClick={() => remove(field.name)}
                          color="danger"
                        />
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          add();
                        }
                      }}
                    />
                  </Form.Item>
                </Form.Item>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  style={{ width: "100%" }}
                >
                  {t("Add Task")}
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </React.Fragment>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
});

export default ManageShiftDialog;
