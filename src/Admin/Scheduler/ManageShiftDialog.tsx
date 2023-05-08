/** @jsx jsx */
import { jsx } from "@emotion/react";
import dayjs from "dayjs";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
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
  Input,
  Modal,
  Row,
  Select,
  Space,
  Tag,
  TimePicker,
  Typography,
} from "antd";
import { capitalize, isEmpty } from "lodash";
import {
  checkForOverlappingShiftsARRAY,
  getShiftDayjsDate,
  getShiftLatestData,
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
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(duration);

export const useManageShiftDialog = () => {
  const manageShiftDialogRef = React.useRef<IManageShiftDialogRef>(null);

  const openNew = useCallback((employee: IEmployee, date: dayjs.Dayjs) => {
    manageShiftDialogRef.current?.openNew(employee, date);
  }, []);

  const openEdit = useCallback((employee: IEmployee, shift: IShift) => {
    manageShiftDialogRef.current?.openEdit(employee, shift);
  }, []);

  return {
    openNew,
    openEdit,
    ManageShiftDialog: <ManageShiftDialog ref={manageShiftDialogRef} />,
  };
};

export interface IManageShiftDialogRef {
  openNew: (employee: IEmployee, date: dayjs.Dayjs) => void;
  openEdit: (employee: IEmployee, shift: IShift) => void;
}

type FormDataType = {
  applyTo: number[];
  notes?: string;
  position?: string;
  timeRange: { start: dayjs.Dayjs; end: dayjs.Dayjs };
};

type State = {
  open: boolean;
  employee: IEmployee;
  shift: IShift | null;
  date: dayjs.Dayjs;
};

const ManageShiftDialog = forwardRef<IManageShiftDialogRef, unknown>(
  (_, ref) => {
    const checkPermission = useLocationPermissions();
    const { location, scheduleSettings } = useCuttinboardLocation();
    const [form] = Form.useForm<FormDataType>();
    const { createShift, weekDays, updateShift, shifts } = useSchedule();
    const { t } = useTranslation();
    const [state, setState] = useState<State>({
      open: false,
      employee: {} as IEmployee,
      shift: null,
      date: dayjs(),
    });

    useImperativeHandle(ref, () => ({
      openNew,
      openEdit,
    }));

    const openNew = useCallback(
      (employee: IEmployee, date: dayjs.Dayjs) => {
        const weekDay = date.isoWeekday();
        const position =
          employee.positions && employee.positions.length === 1
            ? employee.positions[0]
            : undefined;

        form.setFieldsValue({
          applyTo: [weekDay],
          timeRange: {
            start: date.add(8, "hours"),
            end: date.add(16, "hours"),
          },
          position,
        });
        setState({
          open: true,
          employee,
          shift: null,
          date,
        });
      },
      [form]
    );

    const openEdit = useCallback(
      (employee: IEmployee, shiftRaw: IShift) => {
        const shift = getShiftLatestData(shiftRaw);
        const startDate = getShiftDayjsDate(shift, "start");
        const applyTo = [startDate.isoWeekday()];
        const notes = shift.notes;
        const position = shift.position;
        const timeRange = {
          start: startDate,
          end: getShiftDayjsDate(shift, "end"),
        };
        form.setFieldsValue({ applyTo, notes, position, timeRange });
        setState({
          open: true,
          employee,
          shift,
          date: startDate,
        });
      },
      [form]
    );

    const handleClose = useCallback(() => {
      setState({
        open: false,
        employee: {} as IEmployee,
        shift: null,
        date: dayjs(),
      });
      form.resetFields();
    }, [form]);

    const onFinish = useCallback(
      (values: FormDataType) => {
        const { applyTo, notes, position, timeRange } = values;

        const hourlyWage = position
          ? getEmployeeHourlyWage(state.employee, position)
          : 0;

        const shiftToSaveBase: IPrimaryShiftData = {
          start: Shift.toString(timeRange.start.toDate()),
          end: Shift.toString(timeRange.end.toDate()),
          notes: notes ?? "",
          position: position ?? "",
          hourlyWage,
        };

        const weekId = state.date.format(WEEKFORMAT);

        if (!state.shift) {
          const newShift: IShift = {
            ...shiftToSaveBase,
            id: nanoid(),
            status: "draft",
            updatedAt: Timestamp.now().toMillis(),
            weekId,
            locationName: location.name,
            locationId: location.id,
            employeeId: state.employee.id,
            weekOrderFactor: 0,
          };
          createShift(newShift, weekDays, applyTo);
        } else {
          updateShift(state.shift, shiftToSaveBase);
        }
        handleClose();
      },
      [
        createShift,
        handleClose,
        location.id,
        location.name,
        state.date,
        state.employee,
        state.shift,
        updateShift,
        weekDays,
      ]
    );

    // Get Employee shifts
    const employeeShiftsArray = useMemo(() => {
      if (!state.employee) {
        return null;
      }
      return shifts.filter(
        ({ employeeId }) => employeeId === state.employee.id
      );
    }, [state.employee, shifts]);

    const validateTimeRange = useCallback(
      async (_: unknown, value: FormDataType["timeRange"]) => {
        // Check if a time range has been selected
        if (!value) {
          return Promise.reject(t("Please select a time range"));
        }

        // Get the value for the "applyTo" field
        const applyTo: FormDataType["applyTo"] = form.getFieldValue("applyTo");

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

          // Check if the shift overlaps with any other shifts for the employee
          const shiftOverlaps =
            employeeShiftsArray &&
            checkForOverlappingShiftsARRAY(
              employeeShiftsArray,
              fixedStart,
              fixedEnd,
              state.shift?.id ?? ""
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
      [form, employeeShiftsArray, state.shift?.id, t, weekDays]
    );

    const normalizeStart = useCallback(
      (
        value: FormDataType["timeRange"]["start"],
        _: unknown,
        all: FormDataType
      ) => {
        // If end time is before start time, add a day to the end time
        if (all?.timeRange?.end?.isBefore(value)) {
          // Add a day to the end time
          const end = all.timeRange.end.add(1, "day");

          form.setFieldValue(["timeRange", "end"], end);
        }
        return value;
      },
      [form]
    );

    const normalizeEnd = useCallback(
      (value: FormDataType["timeRange"]["end"], _, all: FormDataType) => {
        // If end time is before start time, add a day to the end time
        const end = value?.isBefore(all?.timeRange?.start)
          ? value?.add(1, "day")
          : value;
        return end;
      },
      []
    );

    if (!form) {
      return null;
    }

    return (
      <Modal
        open={state.open}
        zIndex={1000}
        onCancel={handleClose}
        title={t(!state.shift ? "Add Shift" : "Edit Shift")}
        footer={[
          <Button key="back" onClick={handleClose}>
            {t("Cancel")}
          </Button>,
          <Button key="submit" type="primary" onClick={form.submit}>
            {t("Accept")}
          </Button>,
        ]}
      >
        <Form<FormDataType>
          form={form}
          onFinish={onFinish}
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

                <Form.Item<FormDataType["timeRange"]>
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
                    const timeRange: FormDataType["timeRange"] =
                      getFieldValue("timeRange");
                    if (
                      isEmpty(timeRange) ||
                      !timeRange.start ||
                      !timeRange.end
                    ) {
                      return null;
                    }
                    const start = timeRange.start;
                    const end = timeRange.end;
                    const duration = dayjs
                      .duration(end.diff(start))
                      .format("[🕘] HH[h] mm[min]");

                    return (
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                      >
                        {duration}
                      </Typography.Text>
                    );
                  }}
                </Form.Item>
              </div>

              {/**
               * Quick add buttons
               */}
              {scheduleSettings?.presetTimes &&
                scheduleSettings.presetTimes.length > 0 && (
                  <Form.Item css={{ marginTop: 20 }}>
                    <Space wrap>
                      {scheduleSettings.presetTimes.map((presetTime, index) => {
                        const startTime = dayjs(presetTime.start, "HH:mm");
                        const endTime = dayjs(presetTime.end, "HH:mm");
                        // create moment objects for the start and end times based on the current date
                        const startMoment = state.date
                          .set("hour", startTime.hour())
                          .set("minute", startTime.minute());
                        const endMoment = state.date
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
            </React.Fragment>
          </Form.Item>

          <Divider />

          {!state.shift && (
            <Form.Item label={t("Apply to:")} name="applyTo">
              <Checkbox.Group>
                <Row>
                  {weekDays.map((wd, i) => (
                    <Col xs={12} sm={8} md={6} key={i}>
                      <Checkbox
                        value={wd.isoWeekday()}
                        disabled={Boolean(
                          wd.isoWeekday() === state.date.isoWeekday()
                        )}
                      >
                        {capitalize(wd.format("dddd"))}
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </Form.Item>
          )}

          {state.employee.role > RoleAccessLevels.ADMIN && (
            <React.Fragment>
              <Form.Item name="position">
                <Select placeholder={t("Select Position")}>
                  <Select.Option value="">{t("No position")}</Select.Option>
                  {state.employee.positions?.map((position) => {
                    const isMainPos = state.employee.mainPosition === position;
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

              {checkPermission("seeWages") && (
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
                    const position: FormDataType["position"] =
                      form.getFieldValue(["position"]);
                    const hWage = position
                      ? getEmployeeHourlyWage(state.employee, position)
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
              )}

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
  }
);

export default ManageShiftDialog;
