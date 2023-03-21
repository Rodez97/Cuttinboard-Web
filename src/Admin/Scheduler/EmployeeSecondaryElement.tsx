/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useMemo } from "react";
import { Space, Tag, Tooltip, Typography } from "antd";
import { useSchedule } from "@cuttinboard-solutions/cuttinboard-library";
import currency from "currency.js";
import {
  getEmployeeShiftsSummary,
  IShift,
  minutesToTextDuration,
} from "@cuttinboard-solutions/types-helpers";

const EmployeeSecondaryElement = ({
  employeeId,
  empShifts,
}: {
  employeeId: string;
  empShifts?: IShift[];
}) => {
  const { wageData } = useSchedule();
  const summaryText = useMemo(() => {
    if (!empShifts || !wageData) {
      return `${0}h ${0}min - ${currency(0).format()}`;
    }

    const weekData = wageData[employeeId]?.summary;

    const weekSummary = weekData ? getEmployeeShiftsSummary(weekData) : null;

    const totalTime = weekSummary
      ? minutesToTextDuration(weekSummary.totalHours * 60)
      : "0h 0min";

    const totalWage = weekSummary?.totalWage ?? 0;

    return `${totalTime} - ${currency(totalWage).format()}`;
  }, [empShifts, employeeId, wageData]);

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
            <Typography.Text css={{ color: "inherit" }}>{`OT pay: ${currency(
              overtime.overtimeWage
            ).format()}`}</Typography.Text>
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
