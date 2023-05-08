/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useMemo } from "react";
import { Space, Tag, Tooltip, Typography } from "antd";
import {
  getEmployeeShiftsSummary,
  minutesToTextDuration,
  useLocationPermissions,
  useSchedule,
} from "@cuttinboard-solutions/cuttinboard-library";
import currency from "currency.js";
import { useTranslation } from "react-i18next";
import { IShift } from "@cuttinboard-solutions/types-helpers";

const EmployeeSecondaryElement = ({
  employeeId,
  empShifts,
}: {
  employeeId: string;
  empShifts?: IShift[];
}) => {
  const { t } = useTranslation();
  const checkPermission = useLocationPermissions();
  const { wageData } = useSchedule();
  const summaryText = useMemo(() => {
    if (!empShifts || !wageData) {
      if (!checkPermission("seeWages")) {
        return `0h 0min`;
      } else {
        return `0h 0min - ${currency(0).format()}`;
      }
    }

    const weekData = wageData[employeeId]?.summary;

    const weekSummary = weekData ? getEmployeeShiftsSummary(weekData) : null;

    const totalTime = weekSummary
      ? minutesToTextDuration(weekSummary.totalHours * 60)
      : "0h 0min";

    if (!checkPermission("seeWages")) {
      return totalTime;
    }

    const totalWage = weekSummary?.totalWage ?? 0;

    return `${totalTime} - ${currency(totalWage).format()}`;
  }, [checkPermission, empShifts, employeeId, wageData]);

  const overtime = useMemo(() => {
    if (!empShifts || !wageData) {
      return null;
    }

    const weekData = wageData[employeeId]?.summary;

    const weekSummary = weekData ? getEmployeeShiftsSummary(weekData) : null;

    const haveOvertime = weekSummary && weekSummary.overtimeHours > 0;

    if (!haveOvertime) {
      return null;
    }

    const overtimeText = minutesToTextDuration(weekSummary.overtimeHours * 60);

    const overtimeWage = weekSummary.overtimeWage;

    return {
      overtimeText,
      overtimeWage,
    };
  }, [empShifts, employeeId, wageData]);

  if (overtime) {
    return (
      <Tooltip
        title={
          <Space direction="vertical">
            <Typography.Text
              css={{ color: "inherit" }}
            >{`OT: ${overtime.overtimeText}`}</Typography.Text>
            {checkPermission("seeWages") && (
              <Typography.Text css={{ color: "inherit" }}>
                {t(`OT pay: {{0}}`, {
                  0: currency(overtime.overtimeWage).format(),
                })}
              </Typography.Text>
            )}
          </Space>
        }
      >
        <Tag color="error">{summaryText}</Tag>
      </Tooltip>
    );
  }

  return (
    <div>
      <Tag color="processing">{summaryText}</Tag>
    </div>
  );
};

export default EmployeeSecondaryElement;
