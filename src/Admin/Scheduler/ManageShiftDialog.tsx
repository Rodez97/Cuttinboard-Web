import dayjs from "dayjs";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { nanoid } from "nanoid";
import { useTranslation } from "react-i18next";
import { orderBy, uniq } from "lodash";
import isoWeek from "dayjs/plugin/isoWeek";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import duration from "dayjs/plugin/duration";
import {
  Employee,
  Shift,
  Todo_Task,
} from "@cuttinboard/cuttinboard-library/models";
import {
  getShiftDate,
  getShiftString,
  useLocation,
  useSchedule,
} from "@cuttinboard/cuttinboard-library/services";
import { Colors } from "@cuttinboard/cuttinboard-library/utils";
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
  Statistic,
  Switch,
  TimePicker,
  Typography,
} from "antd";
import moment from "moment";
import styled from "@emotion/styled";
import TextArea from "antd/lib/input/TextArea";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { recordError } from "../../utils/utils";
import { serverTimestamp } from "firebase/firestore";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(duration);

export interface IManageShiftDialogRef {
  openNew: (employee: Employee, column: Date, weekId: string) => void;
  openEdit: (employee: Employee, shift: Shift) => void;
}

type FormDataType = {
  applyTo: number[];
  notes?: string;
  position?: string;
  repeat: boolean;
  tasks?: string[];
  timeRange: [moment.Moment, moment.Moment];
};

const ManageShiftDialog = forwardRef<IManageShiftDialogRef, {}>((_, ref) => {
  const [form] = Form.useForm<FormDataType>();
  const position = Form.useWatch("position", form);
  const timeRange = Form.useWatch("timeRange", form);
  const [initialValues, setInitialValues] = useState<FormDataType>(null);
  const [baseShift, setbaseShift] = useState<Shift>(null);
  const [saving, setSaving] = useState(false);
  const { locationId } = useLocation();
  const { createShift, editShift, weekId, weekDays } = useSchedule();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isNewShift, setIsNewShift] = useState(false);
  const [baseDate, setBaseDate] = useState<Date>();
  const [employee, setEmployee] = useState<Employee>(null);

  useImperativeHandle(ref, () => ({
    openNew,
    openEdit,
  }));

  const openNew = (employee: Employee, date: Date, weekId: string) => {
    const position =
      employee.role === "employee"
        ? employee.locations[locationId]?.mainPosition ??
          (employee.locations[locationId] &&
            orderBy(employee.locations[locationId]?.pos)[0])
        : null;
    setIsNewShift(true);
    setEmployee(employee);
    setInitialValues({
      applyTo: [date.getDay()],
      timeRange: [moment(date).add(8, "hours"), moment(date).add(16, "hours")],
      position,
      repeat: false,
    });
    setBaseDate(date);
    setOpen(true);
  };

  const openEdit = (employee: Employee, shift: Shift) => {
    setIsNewShift(false);
    setEmployee(employee);
    setbaseShift(shift);
    setInitialValues({
      applyTo: [getShiftDate(shift.start).day()],
      notes: shift.notes,
      position: shift.position,
      repeat: Boolean(shift.altId === "repeat"),
      tasks: Object.values(shift.tasks).map((tsk) => tsk.name),
      timeRange: [
        moment(getShiftDate(shift.start).toDate()),
        moment(getShiftDate(shift.end).toDate()),
      ],
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    form?.resetFields();
  };

  const onFinish = async (values: FormDataType) => {
    const { applyTo, notes, position, repeat, tasks, timeRange } = values;

    const shiftToSave: Partial<Shift> = {
      start: getShiftString(timeRange[0].toDate()),
      end: getShiftString(timeRange[1].toDate()),
      notes,
      position,
      altId: repeat ? "repeat" : weekId,
      employeeId: employee.id,
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
          { ...shiftToSave, tasks: transformedTasks },
          weekDays,
          applyTo,
          nanoid()
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
        await editShift({
          ...baseShift,
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

  const getDuration = useCallback(() => {
    if (!timeRange) {
      return;
    }
    const start = dayjs(timeRange[0].toDate());
    const end = dayjs(timeRange[1].toDate());
    return dayjs.duration(end.diff(start)).format("[🕘] H[h] m[min]");
  }, [timeRange]);

  const getHourlyWage = useCallback(
    (pos: string = position) =>
      employee.role === "employee"
        ? employee.locations[locationId]?.wagePerPosition?.[pos] ?? 0
        : 0,
    [employee, locationId, position]
  );

  if (!initialValues) {
    return null;
  }

  return (
    <Modal
      visible={open}
      onCancel={handleClose}
      title={
        <>
          {t(isNewShift ? "Add Shift" : "Edit Shift")}
          <Divider type="vertical" />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {getDuration()}
          </Typography.Text>
        </>
      }
      footer={[
        <Button key="back" onClick={handleClose} disabled={saving}>
          {t("Cancel")}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={saving}
          onClick={form?.submit}
        >
          {t("Accept")}
        </Button>,
      ]}
    >
      <Form<FormDataType>
        form={form}
        initialValues={initialValues}
        onFinish={onFinish}
        disabled={saving}
        size="small"
        layout="vertical"
      >
        <Form.Item
          name="timeRange"
          required
          rules={[{ required: true, message: "" }]}
        >
          <TimePicker.RangePicker
            placeholder={["Start", "End"]}
            use12Hours
            format="hh:mm a"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          name="repeat"
          label={t("Repeat every week")}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        {isNewShift && (
          <Form.Item label={t("Apply to:")} name="applyTo">
            <Checkbox.Group>
              <Row>
                {weekDays.map((wd) => (
                  <Col xs={12} sm={8} md={6}>
                    <Checkbox
                      value={wd.getDay()}
                      disabled={Boolean(wd.getDay() === baseDate.getDay())}
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
          <>
            <Form.Item name="position">
              <Select placeholder={t("Select Position")}>
                <Select.Option value="">{t("No Position")}</Select.Option>
                {employee?.locations?.[locationId].pos?.map((position) => {
                  const isMainPos =
                    employee?.role === "employee" &&
                    employee?.locations?.[locationId].mainPosition === position;
                  return (
                    <Select.Option
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
            <Typography.Text
              style={{ display: "flex", justifyContent: "center" }}
            >
              {t("Hourly Wage")}:
              <Typography.Text mark>
                {getHourlyWage()?.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </Typography.Text>
            </Typography.Text>
            <Divider />
          </>
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
            <>
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
                      placeholder={t("Add task")}
                      addonAfter={
                        <MinusCircleOutlined
                          onClick={() => remove(field.name)}
                          color="danger"
                        />
                      }
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
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
});

export default ManageShiftDialog;
