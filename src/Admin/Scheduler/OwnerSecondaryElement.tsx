import React, { useMemo } from "react";
import { Tag } from "antd";
import { useSchedule } from "@cuttinboard-solutions/cuttinboard-library";
import {
  getEmployeeShiftsSummary,
  IShift,
  minutesToTextDuration,
} from "@cuttinboard-solutions/types-helpers";

const OwnerSecondaryElement = ({
  employeeId,
  empShifts,
}: {
  employeeId: string;
  empShifts?: IShift[];
}) => {
  const { wageData } = useSchedule();
  const totalTime = useMemo(() => {
    if (!empShifts || !wageData) {
      return `${0}h ${0}min`;
    }
    const weekData = wageData[employeeId]?.summary;
    const weekSummary = getEmployeeShiftsSummary(weekData);
    return minutesToTextDuration(weekSummary.totalHours * 60);
  }, [empShifts, employeeId, wageData]);

  return (
    <div>
      <Tag color="processing">{totalTime}</Tag>
    </div>
  );
};

export default OwnerSecondaryElement;
