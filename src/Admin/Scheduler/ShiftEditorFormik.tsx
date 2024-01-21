/** @jsx jsx */
import { jsx } from "@emotion/react";
import dayjs, { Dayjs } from "dayjs";
import React, { useCallback, useEffect } from "react";
import { nanoid } from "nanoid";
import { useTranslation } from "react-i18next";
import isoWeek from "dayjs/plugin/isoWeek";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  Alert,
  Button,
  Divider,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  TimePicker,
} from "antd/es";
import {
  checkForOverlappingShiftsARRAY,
  useCuttinboardLocation,
} from "@rodez97/cuttinboard-library";
import { useSchedule } from "@rodez97/cuttinboard-library";
import { Timestamp } from "firebase/firestore";
import {
  IEmployee,
  IPrimaryShiftData,
  IShift,
  RoleAccessLevels,
  Shift,
  WEEKFORMAT,
  getEmployeeHourlyWage,
} from "@rodez97/types-helpers";
import { logAnalyticsEvent } from "utils/analyticsHelpers";
import { recordError } from "../../utils/utils";
import PresetShiftsButtons from "./PresetShiftsBtns";
import { useFormik } from "formik";
import { compact } from "lodash-es";
import ShiftPositionWage from "./ShiftPositionWage";
import WeekdaysPicker from "./WeekdaysPicker";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

export type ShiftFormDataType = {
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
  notes?: string;
  position?: string;
  applyTo: number[];
};

interface ShiftEditorProps {
  employee: IEmployee;
  date: dayjs.Dayjs;
  isOpen: boolean;
  onClose: () => void;
  shift?: IShift;
  initialValues: ShiftFormDataType;
}

const ShiftEditor: React.FC<ShiftEditorProps> = ({
  employee,
  date,
  isOpen,
  onClose,
  shift,
  initialValues,
}) => {
  const { location } = useCuttinboardLocation();
  const { createShift, weekDays, updateShift, shifts } = useSchedule();
  const { t } = useTranslation();

  const validate = (values: ShiftFormDataType) => {
    const errors: Partial<ShiftFormDataType> = {};
    if (!values.start) {
      errors.start = t("Start time is required");
    }
    if (!values.end) {
      errors.end = t("End time is required");
    }
    const { start, end, applyTo } = values;
    const normalizedApplyTo: number[] = applyTo ? compact(applyTo) : [];
    const overlaps = validateOverlappingShifts(normalizedApplyTo, start, end);
    if (overlaps) {
      errors.start = t(
        "This shift overlaps with another shift for this employee"
      );
    }

    return errors;
  };

  const {
    values,
    setFieldValue,
    submitForm,
    handleChange,
    setValues,
    isSubmitting,
    errors,
  } = useFormik<ShiftFormDataType>({
    initialValues,
    validate,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      const { notes, position, start, end, applyTo } = values;

      const hourlyWage = position
        ? getEmployeeHourlyWage(employee, position)
        : 0;

      const shiftToSave: IPrimaryShiftData = {
        start: Shift.toString(start.toDate()),
        end: Shift.toString(end.toDate()),
        notes: notes ?? "",
        position: position ?? "",
        hourlyWage,
      };

      const weekId = date.format(WEEKFORMAT);

      try {
        if (!shift) {
          const newShift: IShift = {
            ...shiftToSave,
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
          await updateShift(shift, shiftToSave);
        }
        setStatus({ success: true });
        onClose();
      } catch (error) {
        recordError(error);
        setStatus({ success: false });
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues, setValues]);

  const validateOverlappingShifts = useCallback(
    (applyTo: number[], startDayjs: dayjs.Dayjs, endDayjs: dayjs.Dayjs) => {
      const employeeShiftsArray = shifts.filter(
        ({ employeeId }) => employeeId === employee.id
      );

      if (!employeeShiftsArray.length) {
        return false;
      }

      return applyTo.some((day) => {
        const weekDay = weekDays.find((wd) => wd.isoWeekday() === day);
        if (!weekDay) {
          throw new Error("Week day not found");
        }
        const start = weekDay
          .hour(startDayjs.hour())
          .minute(startDayjs.minute());
        let end = weekDay.hour(endDayjs.hour()).minute(endDayjs.minute());
        // If end time is before start time, add a day to the end time
        if (end.isBefore(start)) {
          end = end.add(1, "day");
        }

        // Check if overlaps
        const shiftOverlaps = checkForOverlappingShiftsARRAY(
          employeeShiftsArray,
          start,
          end,
          shift ? shift.id : ""
        );

        return shiftOverlaps;
      });
    },
    [shifts, employee.id, weekDays, shift]
  );

  const onTimeRangeChange = (value: [Dayjs, Dayjs]) => {
    const [start, end] = value;
    // If end time is before start time, add a day to the end time
    const fixedEnd = end.isBefore(start) ? end.add(1, "day") : end;
    setFieldValue("start", start);
    setFieldValue("end", fixedEnd);
  };

  return (
    <Drawer
      forceRender
      open={isOpen}
      width={400}
      onClose={onClose}
      title={t(!shift ? "Add Shift" : "Edit Shift")}
      extra={
        <Space>
          <Button key="back" onClick={onClose} disabled={isSubmitting}>
            {t("Cancel")}
          </Button>
          <Button
            key="submit"
            type="primary"
            onClick={submitForm}
            loading={isSubmitting}
          >
            {t("Accept")}
          </Button>
        </Space>
      }
    >
      <Space size="small" direction="vertical">
        <div
          css={{
            display: "flex",
            flexDirection: "row",
            gap: 1,
            width: "100%",
          }}
        >
          <Form.Item
            css={{ width: "100%" }}
            required
            help={t("Start time of the shift")}
          >
            <TimePicker
              name="start"
              allowClear={false}
              placeholder={t("Start")}
              minuteStep={5}
              format="hh:mm a"
              use12Hours
              css={{ width: "100%" }}
              showNow={false}
              value={values.start}
              changeOnBlur
              onChange={(value) => {
                if (!value) {
                  return;
                }
                onTimeRangeChange([value, values.end]);
              }}
            />
          </Form.Item>

          <Form.Item
            css={{ width: "100%" }}
            required
            help={t("End time of the shift")}
          >
            <TimePicker
              name="end"
              allowClear={false}
              placeholder={t("End")}
              minuteStep={5}
              format="hh:mm a"
              use12Hours
              css={{ width: "100%" }}
              showNow={false}
              value={values.end}
              changeOnBlur
              onChange={(value) => {
                if (!value) {
                  return;
                }
                onTimeRangeChange([values.start, value]);
              }}
            />
          </Form.Item>
        </div>

        {/**
         * Quick add buttons
         */}
        <PresetShiftsButtons
          date={date}
          onChange={({ start, end }) => {
            setFieldValue("start", start);
            setFieldValue("end", end);
          }}
        />

        <Divider />

        {!shift && (
          <Form.Item label={t("Apply to:")}>
            <WeekdaysPicker
              value={values.applyTo}
              onChange={(values) => {
                setFieldValue("applyTo", values);
              }}
              baseDay={date.isoWeekday()}
            />
          </Form.Item>
        )}

        {errors.start ? (
          <Alert type="error" message={errors.start as string} />
        ) : errors.end ? (
          <Alert type="error" message={errors.end as string} />
        ) : (
          errors.applyTo && (
            <Alert type="error" message={errors.applyTo as string} />
          )
        )}

        {employee.role > RoleAccessLevels.ADMIN && (
          <React.Fragment>
            <Select
              css={{ width: "100%" }}
              placeholder={t("Select Position")}
              value={values.position}
              onChange={(value) => {
                setFieldValue("position", value);
              }}
            >
              <Select.Option value="">{t("No position")}</Select.Option>
              {employee.positions?.map((position) => {
                return (
                  <Select.Option key={position} value={position}>
                    {position}
                  </Select.Option>
                );
              })}
            </Select>

            <ShiftPositionWage employee={employee} position={values.position} />

            <Divider />
          </React.Fragment>
        )}

        <Input.TextArea
          placeholder={t("Notes for employee")}
          showCount
          maxLength={500}
          rows={2}
          value={values.notes}
          name="notes"
          onChange={handleChange}
        />
      </Space>
    </Drawer>
  );
};

export default ShiftEditor;
