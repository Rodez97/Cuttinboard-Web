/** @jsx jsx */
import { jsx } from "@emotion/react";
import dayjs from "dayjs";
import React, { useCallback, useState } from "react";
import { nanoid } from "nanoid";
import { useTranslation } from "react-i18next";
import isoWeek from "dayjs/plugin/isoWeek";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import duration from "dayjs/plugin/duration";
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Form,
  FormInstance,
  Input,
  Modal,
  Row,
  Select,
  Tag,
  TimePicker,
  Typography,
} from "antd/es";
import capitalize from "lodash-es/capitalize";
import {
  checkForOverlappingShiftsARRAY,
  useCuttinboardLocation,
  useLocationPermissions,
} from "@cuttinboard-solutions/cuttinboard-library";
import { useSchedule } from "@cuttinboard-solutions/cuttinboard-library";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library";
import { Timestamp } from "firebase/firestore";
import {
  IEmployee,
  IPrimaryShiftData,
  IShift,
  RoleAccessLevels,
  Shift,
  WEEKFORMAT,
  getEmployeeHourlyWage,
} from "@cuttinboard-solutions/types-helpers";
import { logAnalyticsEvent } from "utils/analyticsHelpers";
import { recordError } from "../../utils/utils";
import PresetShiftsButtons from "./PresetShiftsBtns";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(duration);

export type ShiftFormDataType = {
  applyTo: number[];
  notes?: string;
  position?: string;
  timeRange: { start: dayjs.Dayjs; end: dayjs.Dayjs };
};

interface ShiftEditorProps {
  employee: IEmployee;
  date: dayjs.Dayjs;
  isOpen: boolean;
  onClose: () => void;
  shift?: IShift;
  form: FormInstance<ShiftFormDataType>;
}

const ShiftEditor = ({
  employee,
  date,
  isOpen,
  onClose,
  shift,
  form,
}: ShiftEditorProps) => {
  const checkPermission = useLocationPermissions();
  const { location } = useCuttinboardLocation();
  const { createShift, weekDays, updateShift, shifts } = useSchedule();
  const { t } = useTranslation();
  const [processing, setProcessing] = useState(false);

  const handleClose = useCallback(() => {
    form.resetFields();
    onClose();
  }, [form, onClose]);

  const onFinish = useCallback(
    async (values: ShiftFormDataType) => {
      setProcessing(true);
      const { applyTo, notes, position, timeRange } = values;

      const hourlyWage = position
        ? getEmployeeHourlyWage(employee, position)
        : 0;

      const shiftToSaveBase: IPrimaryShiftData = {
        start: Shift.toString(timeRange.start.toDate()),
        end: Shift.toString(timeRange.end.toDate()),
        notes: notes ?? "",
        position: position ?? "",
        hourlyWage,
      };

      const weekId = date.format(WEEKFORMAT);

      try {
        if (!shift) {
          const newShift: IShift = {
            ...shiftToSaveBase,
            id: nanoid(),
            status: "draft",
            updatedAt: Timestamp.now().toMillis(),
            weekId,
            locationName: location.name,
            locationId: location.id,
            employeeId: employee.id,
            weekOrderFactor: 0,
          };
          await createShift(newShift, weekDays, applyTo);
          logAnalyticsEvent("schedule_shift_created", {
            appliedTo: applyTo.length,
            hasNotes: !!notes,
          });
        } else {
          await updateShift(shift, shiftToSaveBase);
        }
        handleClose();
      } catch (error) {
        recordError(error);
      } finally {
        setProcessing(false);
      }
    },
    [
      createShift,
      date,
      employee,
      handleClose,
      location.id,
      location.name,
      shift,
      updateShift,
      weekDays,
    ]
  );

  const validateTimeRange = useCallback(
    async (_: unknown, value: ShiftFormDataType["timeRange"]) => {
      // Check if a time range has been selected
      if (!value) {
        return Promise.reject(t("Please select a time range"));
      }

      // Get the value for the "applyTo" field
      const applyTo: ShiftFormDataType["applyTo"] =
        form.getFieldValue("applyTo");

      // Destructure the start and end values from the time range
      const { start, end } = value;

      if (start.isSame(end)) {
        return Promise.reject(t("Start and end times cannot be the same"));
      }

      // Iterate over the days that the shift should be applied to
      for (const day of applyTo) {
        // Find the week day object corresponding to the current day
        const weekDay = weekDays.find((wd) => wd.isoWeekday() === day);
        // If no week day is found, return an error
        if (!weekDay) {
          return Promise.reject(t("Invalid day"));
        }

        // Set the start and end times for the current day
        const fixedStart = weekDay.hour(start.hour()).minute(start.minute());
        let fixedEnd = weekDay.hour(end.hour()).minute(end.minute());

        // If the end time is before the start time, add a day to the end time
        if (fixedEnd.isBefore(fixedStart)) {
          fixedEnd = fixedEnd.add(1, "day");
        }

        const employeeShiftsArray = shifts.filter(
          ({ employeeId }) => employeeId === employee.id
        );

        // Check if the shift overlaps with any other shifts for the employee
        const shiftOverlaps =
          employeeShiftsArray &&
          checkForOverlappingShiftsARRAY(
            employeeShiftsArray,
            fixedStart,
            fixedEnd,
            shift?.id ?? ""
          );

        // If the shift overlaps with another shift, return an error
        if (shiftOverlaps) {
          return Promise.reject(
            t("This shift overlaps with another shift for this employee")
          );
        }
      }

      // If there are no overlapping shifts, return a resolved promise
      return Promise.resolve();
    },
    [form, t, weekDays, shifts, shift?.id, employee.id]
  );

  const normalizeStart = (
    value: ShiftFormDataType["timeRange"]["start"],
    _: unknown,
    all: ShiftFormDataType
  ) => {
    // If end time is before start time, add a day to the end time
    if (all?.timeRange?.end?.isBefore(value)) {
      // Add a day to the end time
      const end = all.timeRange.end.add(1, "day");

      form.setFieldValue(["timeRange", "end"], end);
    }
    return value;
  };

  const normalizeEnd = (
    value: ShiftFormDataType["timeRange"]["end"],
    _,
    all: ShiftFormDataType
  ) => {
    // If end time is before start time, add a day to the end time
    const end = value?.isBefore(all?.timeRange?.start)
      ? value?.add(1, "day")
      : value;
    return end;
  };

  return (
    <Modal
      open={isOpen}
      zIndex={1000}
      onCancel={handleClose}
      closable={false}
      title={t(!shift ? "Add Shift" : "Edit Shift")}
      footer={[
        <Button key="back" onClick={handleClose} disabled={processing}>
          {t("Cancel")}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={form.submit}
          loading={processing}
        >
          {t("Accept")}
        </Button>,
      ]}
    >
      <Form<ShiftFormDataType>
        form={form}
        onFinish={onFinish}
        size="small"
        layout="vertical"
        autoComplete="off"
        disabled={processing}
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
              validator: validateTimeRange,
            },
          ]}
        >
          <React.Fragment>
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
                normalize={normalizeStart}
                dependencies={["timeRange", "end"]}
              >
                <TimePicker
                  allowClear={false}
                  placeholder={t("Start")}
                  minuteStep={5}
                  format="hh:mm a"
                  use12Hours
                  css={{ width: "100%" }}
                  showNow={false}
                />
              </Form.Item>

              <Form.Item<ShiftFormDataType["timeRange"]>
                name={["timeRange", "end"]}
                css={{ width: "100%" }}
                trigger="onSelect"
                rules={[{ required: true, message: "" }]}
                required
                help={t("End time of the shift")}
                normalize={normalizeEnd}
                dependencies={["timeRange", "start"]}
              >
                <TimePicker
                  allowClear={false}
                  placeholder={t("End")}
                  minuteStep={5}
                  format="hh:mm a"
                  use12Hours
                  css={{ width: "100%" }}
                  showNow={false}
                />
              </Form.Item>
            </div>

            {/**
             * Quick add buttons
             */}
            <PresetShiftsButtons
              date={date}
              onChange={(range) => {
                form.setFieldsValue({
                  ...form.getFieldsValue(),
                  timeRange: range,
                });
              }}
            />
          </React.Fragment>
        </Form.Item>

        <Divider />

        {!shift && (
          <Form.Item label={t("Apply to:")} name="applyTo">
            <Checkbox.Group>
              <Row>
                {weekDays.map((wd, i) => (
                  <Col xs={12} sm={8} md={6} key={i}>
                    <Checkbox
                      value={wd.isoWeekday()}
                      disabled={Boolean(wd.isoWeekday() === date.isoWeekday())}
                    >
                      {capitalize(wd.format("dddd"))}
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
        )}

        {employee.role > RoleAccessLevels.ADMIN && (
          <React.Fragment>
            <Form.Item name="position">
              <Select placeholder={t("Select Position")}>
                <Select.Option value="">{t("No position")}</Select.Option>
                {employee.positions?.map((position) => {
                  return (
                    <Select.Option key={position} value={position}>
                      {position}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>

            {/* {checkPermission("seeWages") && (
              <Form.Item
                shouldUpdate={(
                  prevValues: ShiftFormDataType,
                  curValues: ShiftFormDataType
                ) =>
                  // Only update if the position changes
                  prevValues.position !== curValues.position
                }
              >
                {() => {
                  const position: ShiftFormDataType["position"] =
                    form.getFieldValue(["position"]);
                  const hWage = position
                    ? getEmployeeHourlyWage(employee, position)
                    : 0;
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
            )} */}

            <Divider />
          </React.Fragment>
        )}

        <Form.Item name="notes">
          <Input.TextArea
            placeholder={t("Notes for employee")}
            showCount
            maxLength={500}
            rows={2}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ShiftEditor;
