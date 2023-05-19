/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Alert, Checkbox, Modal, Typography } from "antd/es";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import isoWeek from "dayjs/plugin/isoWeek";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import WeekNavigator from "./WeekNavigator";
import { recordError } from "../../utils/utils";
import { useTranslation } from "react-i18next";
import {
  useEmployees,
  useSchedule,
} from "@cuttinboard-solutions/cuttinboard-library";
import CuttinboardAvatar from "../../shared/atoms/Avatar";
import {
  getEmployeeFullName,
  RoleAccessLevels,
  WEEKFORMAT,
} from "@cuttinboard-solutions/types-helpers";
import { logAnalyticsEvent } from "../../utils/analyticsHelpers";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

function CloneSchedule(props: { open: boolean; onCancel: () => void }) {
  // 2. Get the translation function from the useTranslation hook.
  const { t } = useTranslation();

  // 3. Get the employees using the useAppSelector hook.
  const { employees } = useEmployees();

  // 4. Get the data needed for the cloneWeek function using the useSchedule hook.
  const { cloneWeek, weekId, weekSummary, weekDays } = useSchedule();

  // 5. Create state variables using the useState hook.
  const [isCloning, setIsCloning] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(
    weekDays[0].subtract(1, "week").format(WEEKFORMAT)
  );
  const [selectedEmployees, setSelectedEmployees] = useState(
    employees.map((e) => e.id)
  );

  useEffect(() => {
    setSelectedWeek(weekDays[0].subtract(1, "week").format(WEEKFORMAT));
  }, [weekDays]);

  const handleSelectedEmpChange = useCallback(
    (empId: string) => {
      if (selectedEmployees.includes(empId)) {
        setSelectedEmployees((prev) => prev.filter((e) => e !== empId));
      } else {
        setSelectedEmployees((prev) => [...prev, empId]);
      }
    },
    [selectedEmployees]
  );

  const clone = async () => {
    try {
      setIsCloning(true);
      await cloneWeek(selectedWeek, selectedEmployees);
      props.onCancel();
      // Report to analytics
      logAnalyticsEvent("clone_schedule");
    } catch (error) {
      recordError(error);
    } finally {
      setIsCloning(false);
    }
  };

  const canClone = useMemo(() => {
    // Return false if no employees are selected
    if (selectedEmployees.length === 0) {
      return false;
    }

    // Return false if the selected week is the current week
    if (selectedWeek === weekId) {
      return false;
    }

    // Return false if the current week has shifts scheduled
    if (weekSummary.total.totalShifts > 0) {
      return false;
    }

    // Otherwise, return true
    return true;
  }, [
    // The value of canClone depends on these values
    selectedEmployees.length,
    selectedWeek,
    weekId,
    weekSummary.total.totalShifts,
  ]);

  return (
    <Modal
      title={t("Clone Schedule")}
      {...props}
      onOk={clone}
      cancelText={t("Cancel")}
      confirmLoading={isCloning}
      okButtonProps={{ disabled: !canClone }}
    >
      <Typography.Paragraph
        type="secondary"
        css={{
          textAlign: "center",
        }}
      >
        {t("Select the week you wish to clone:")}
      </Typography.Paragraph>
      <div css={{ display: "flex", justifyContent: "center", margin: 10 }}>
        <WeekNavigator
          currentWeekId={selectedWeek}
          onChange={setSelectedWeek}
        />
      </div>

      {weekId === selectedWeek && (
        <Alert
          showIcon
          type="warning"
          message={t("Cannot clone the same week")}
        />
      )}
      {weekSummary.total.totalShifts > 0 && (
        <Alert
          css={{ marginTop: 10 }}
          showIcon
          type="warning"
          message={t("Cannot clone a week with shifts")}
        />
      )}
      <div
        css={{
          maxHeight: "50vh",
          overflowY: "auto",
          marginTop: 10,
          width: "100%",
        }}
      >
        {employees
          .filter((e) => e.role !== RoleAccessLevels.ADMIN)
          .map((emp) => (
            <div
              key={emp.id}
              css={{
                display: "flex",
                alignItems: "center",
                padding: 10,
                borderBottom: "1px solid #e8e8e8",
              }}
            >
              <CuttinboardAvatar
                src={emp.avatar}
                alt={getEmployeeFullName(emp)}
              />

              <Typography.Text
                ellipsis
                css={{
                  marginLeft: 10,
                  marginRight: 10,
                  flex: 1,
                }}
              >
                {getEmployeeFullName(emp)}
              </Typography.Text>
              <Checkbox
                checked={selectedEmployees.includes(emp.id)}
                onChange={() => handleSelectedEmpChange(emp.id)}
                disabled={!canClone}
              />
            </div>
          ))}
      </div>
    </Modal>
  );
}

export default CloneSchedule;
