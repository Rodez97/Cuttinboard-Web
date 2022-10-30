/** @jsx jsx */
import { jsx } from "@emotion/react";
import dayjs from "dayjs";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
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
import {
  getShiftDate,
  getShiftString,
  useLocation,
  useSchedule,
} from "@cuttinboard-solutions/cuttinboard-library/services";
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
  const position = Form.useWatch("position", form);
  const timeRange = Form.useWatch("timeRange", form);
  const [baseShift, setBaseShift] = useState<Shift>(null);
  const [saving, setSaving] = useState(false);
  const { location } = useLocation();
  const { createShift, weekDays } = useSchedule();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isNewShift, setIsNewShift] = useState(false);
  const [baseDate, setBaseDate] = useState<Date>();
  const [employee, setEmployee] = useState<Employee>(null);

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
    setIsNewShift(true);
    setEmployee(employee);
    setBaseDate(date);
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
    setIsNewShift(false);
    setEmployee(employee);
    setBaseShift(shift);
    const shiftData = shift.hasPendingUpdates ? shift.pendingUpdate : shift;
    form.setFieldsValue({
      applyTo: [getShiftDate(shiftData.start).isoWeekday()],
      notes: shiftData.notes ?? "",
      position: shiftData.position ?? "",
      tasks: Object.values(shiftData.tasks ?? {}).map((tsk) => tsk.name),
      timeRange: {
        start: moment(getShiftDate(shiftData.start).toDate()),
        end: moment(getShiftDate(shiftData.end).toDate()),
      },
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    form?.resetFields();
  };

  const onFinish = async (values: FormDataType) => {
    const { applyTo, notes, position, tasks, timeRange } = values;

    const shiftToSave: Partial<IShift> = {
      start: getShiftString(timeRange.start.toDate()),
      end: getShiftString(timeRange.end.toDate()),
      notes,
      position,
      hourlyWage: getHourlyWage(),
    };

    setSaving(true);
    try {
      if (isNewShift) {
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
          employee.id
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
          baseShift.tasks ?? {}
        );
        await baseShift.editShift({ ...shiftToSave, tasks: transformedTasks });
      }
      handleClose();
    } catch (error) {
      recordError(error);
    }
    setSaving(false);
  };

  const getDuration = useCallback(() => {
    if (isEmpty(timeRange) || !timeRange.start || !timeRange.end) {
      return;
    }
    const start = dayjs(timeRange.start.toDate());
    const end = dayjs(timeRange.end.toDate());
    return dayjs.duration(end.diff(start)).format("[🕘] H[h] m[min]");
  }, [timeRange]);

  const getHourlyWage = useCallback(
    (pos: string = position) => employee.getHourlyWage(pos),
    [employee, location.id, position]
  );

  const cancelPendingUpdate = async () => {
    Modal.confirm({
      title: t("Are you sure to cancel this update?"),
      content: t("The shift will be restored to the previous state"),
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        try {
          await baseShift.cancelUpdate();
          handleClose();
        } catch (error) {
          recordError(error);
        }
      },
      onCancel() {},
    });
  };

  if (!form) {
    return null;
  }

  return (
    <Form<FormDataType>
      form={form}
      onFinish={onFinish}
      disabled={saving}
      size="small"
      layout="vertical"
      autoComplete="off"
    >
      <Modal
        open={open}
        onCancel={handleClose}
        title={
          <React.Fragment>
            {t(isNewShift ? "Add Shift" : "Edit Shift")}
            <Divider type="vertical" />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {getDuration()}
            </Typography.Text>
          </React.Fragment>
        }
        footer={[
          baseShift?.pendingUpdate && (
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
        <Form.Item name="timeRange">
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

            <Form.Item
              name={["timeRange", "end"]}
              css={{ width: "100%" }}
              trigger="onSelect"
              rules={[{ required: true, message: "" }]}
              required
              help={t("End time of the shift")}
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
          </div>
        </Form.Item>

        {isNewShift && (
          <Form.Item label={t("Apply to:")} name="applyTo">
            <Checkbox.Group>
              <Row>
                {weekDays.map((wd, i) => (
                  <Col xs={12} sm={8} md={6} key={i}>
                    <Checkbox
                      value={dayjs(wd).isoWeekday()}
                      disabled={Boolean(
                        dayjs(wd).isoWeekday() === dayjs(baseDate).isoWeekday()
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

        {employee?.role === "employee" && (
          <React.Fragment>
            <Form.Item name="position">
              <Select placeholder={t("Select Position")}>
                <Select.Option value="">{t("No Position")}</Select.Option>
                {employee.positions.map((position) => {
                  const isMainPos = employee.mainPosition === position;
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
              <Tag color={getHourlyWage() > 0 ? "processing" : "error"}>
                {getHourlyWage()?.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                }) + "/hr"}
              </Tag>
            </div>

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
      </Modal>
    </Form>
  );
});

export default ManageShiftDialog;
