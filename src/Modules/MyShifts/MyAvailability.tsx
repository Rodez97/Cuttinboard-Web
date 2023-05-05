/** @jsx jsx */
import { jsx } from "@emotion/react";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Button,
  Checkbox,
  Drawer,
  DrawerProps,
  message,
  Segmented,
  TimePicker,
  Typography,
} from "antd";
import {
  FIRESTORE,
  useCuttinboard,
  useCuttinboardLocation,
  useDisclose,
  useEmployees,
} from "@cuttinboard-solutions/cuttinboard-library";
import usePageTitle from "../../hooks/usePageTitle";
import { WEEKDAYS } from "../Tasks/ManagePeriodicTask";
import { doc, setDoc } from "firebase/firestore";
import {
  IEmployee,
  RoleAccessLevels,
  WeeklyAvailability,
} from "@cuttinboard-solutions/types-helpers";
import { recordError } from "../../utils/utils";
import React, { useMemo } from "react";
import { useFormik } from "formik";
dayjs.extend(isoWeek);

interface WeekDayAvailability {
  range: [Dayjs, Dayjs];
  isAvailable: boolean;
  allDay?: boolean;
}

interface AvailabilityForm {
  [isoWeekDay: number]: WeekDayAvailability;
}

const validateForm = (values: AvailabilityForm) => {
  const errors: Record<string, string> = {};

  Object.entries(values).forEach(
    ([isoWeekDay, value]: [string, WeekDayAvailability]) => {
      const { isAvailable, allDay, range } = value;

      if (isAvailable === true || (isAvailable === false && !allDay)) {
        if (!range || range.length !== 2 || !range[0] || !range[1]) {
          errors[`${isoWeekDay}.range`] = "Please select a time range";
        } else if (!range[0].isValid() || !range[1].isValid()) {
          errors[`${isoWeekDay}.range`] = "Please select a valid time range";
        }
      }
    }
  );

  return errors;
};

function MyAvailabilityDrawer({
  myEmployeeProfile,
  ...props
}: DrawerProps & { myEmployeeProfile: IEmployee }) {
  usePageTitle("My Availability");
  const { t } = useTranslation();
  const { user } = useCuttinboard();
  const { location } = useCuttinboardLocation();
  const { submitForm, values, setFieldValue, errors, isSubmitting } =
    useFormik<AvailabilityForm>({
      initialValues: {
        ...(myEmployeeProfile.weeklyAvailability
          ? Object.entries(myEmployeeProfile.weeklyAvailability)
          : []
        )?.reduce(
          (acc, [weekDay, value]) => ({
            ...acc,
            [weekDay]: {
              range:
                value.startTime && value.endTime
                  ? [
                      dayjs(value.startTime, "HH:mm"),
                      dayjs(value.endTime, "HH:mm"),
                    ]
                  : undefined,
              allDay: value.allDay,
              isAvailable: value.isAvailable,
            },
          }),
          {} as AvailabilityForm[number]
        ),
      },
      validateOnBlur: false,
      validateOnChange: false,
      validate: validateForm,
      onSubmit: async (values, { setStatus, setSubmitting }) => {
        const reference = doc(
          FIRESTORE,
          "Locations",
          location.id,
          "employees",
          "employeesDocument"
        );

        const weeklyAvailability = Object.entries(values).reduce(
          (acc, [isoWeekDay, value]) => ({
            ...acc,
            [isoWeekDay]: value
              ? value.range
                ? {
                    startTime: value.range[0].format("HH:mm"),
                    endTime: value.range[1].format("HH:mm"),
                    isAvailable: value.isAvailable,
                    allDay: value.allDay,
                  }
                : { isAvailable: value.isAvailable, allDay: value.allDay }
              : undefined,
          }),
          {} as Record<number, WeeklyAvailability>
        );

        try {
          await setDoc(
            reference,
            {
              employees: {
                [user.uid]: { weeklyAvailability },
              },
            },
            { merge: true }
          );
          message.success(t("Availability saved"));
          setStatus({ success: true });
        } catch (error) {
          recordError(error);
        } finally {
          setSubmitting(false);
        }
      },
    });

  return (
    <Drawer
      {...props}
      title={t("My Availability")}
      placement="right"
      extra={
        <Button
          type="primary"
          block
          onClick={submitForm}
          loading={isSubmitting}
        >
          {t("Save")}
        </Button>
      }
    >
      <div>
        <Alert
          message={
            <span>
              {t("This is your availability for")}
              {": "}
              <strong>{location.name}</strong>
              {". "}
              <a
                href="http://www.cuttinboard.com/help/availability"
                target="_blank"
                rel="noreferrer"
              >
                {t("Learn more")}
              </a>
            </span>
          }
          type="info"
          showIcon
          css={{
            marginBottom: 16,
          }}
        />
        {WEEKDAYS.map((weekday) => {
          const isAvailable = values[weekday.value]?.isAvailable;
          const isAllDay = values[weekday.value]?.allDay;
          return (
            <div
              key={weekday.value}
              css={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <Typography>{t(weekday.label)}</Typography>
              <Segmented
                options={[
                  {
                    label: t("Not set"),
                    value: "notSet",
                  },
                  {
                    label: t("Available"),
                    value: "available",
                  },
                  {
                    label: t("Unavailable"),
                    value: "unavailable",
                  },
                ]}
                value={
                  typeof isAvailable === "boolean"
                    ? isAvailable
                      ? "available"
                      : "unavailable"
                    : "notSet"
                }
                onChange={(value) => {
                  setFieldValue(
                    `${weekday.value}.isAvailable`,
                    value === "notSet" ? undefined : value === "available"
                  );
                }}
                block
              />

              {isAvailable === false && (
                <Checkbox
                  checked={isAllDay}
                  onChange={(e) => {
                    setFieldValue(`${weekday.value}.allDay`, e.target.checked);
                  }}
                >
                  {t("All day")}
                </Checkbox>
              )}

              {(isAvailable === true ||
                (isAvailable === false && !isAllDay)) && (
                <TimePicker.RangePicker
                  format="hh:mm A"
                  name={`${weekday.value}.range`}
                  placeholder={[t("From"), t("To")]}
                  status={errors[`${weekday.value}.range`] ? "error" : ""}
                  value={values[weekday.value]?.range}
                  onChange={(value) => {
                    setFieldValue(`${weekday.value}.range`, [
                      value?.[0],
                      value?.[1],
                    ]);
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </Drawer>
  );
}

export default function MyAvailability() {
  const { t } = useTranslation();
  const { user } = useCuttinboard();
  const { getEmployeeById } = useEmployees();
  const [isAvailabilityOpen, openAvailability, closeAvailability] =
    useDisclose(false);
  const { role } = useCuttinboardLocation();
  const myEmployeeProfile = useMemo(
    () => (role !== RoleAccessLevels.ADMIN ? getEmployeeById(user.uid) : null),
    [getEmployeeById, role, user.uid]
  );

  if (!myEmployeeProfile) {
    return null;
  }

  return (
    <React.Fragment>
      <Button onClick={openAvailability}>{t("My Availability")}</Button>
      <MyAvailabilityDrawer
        open={isAvailabilityOpen}
        onClose={closeAvailability}
        myEmployeeProfile={myEmployeeProfile}
      />
    </React.Fragment>
  );
}
