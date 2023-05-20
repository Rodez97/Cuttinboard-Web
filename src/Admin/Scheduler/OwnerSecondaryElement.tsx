import React, { useMemo } from "react";
import { Tag } from "antd/es";
import {
  getEmployeeShiftsSummary,
  minutesToTextDuration,
  useEmployeeWageData,
} from "@cuttinboard-solutions/cuttinboard-library";
import type { IShift } from "@cuttinboard-solutions/types-helpers";

const OwnerSecondaryElement = ({
  employeeId,
  empShifts,
}: {
  employeeId: string;
  empShifts?: IShift[];
}) => {
  const wageData = useEmployeeWageData(employeeId);
  const totalTime = useMemo(() => {
    if (!empShifts || !wageData) {
      return `${0}h ${0}min`;
    }
    const weekData = wageData.summary;
    const weekSummary = getEmployeeShiftsSummary(weekData);
    return minutesToTextDuration(weekSummary.totalHours * 60);
  }, [empShifts, wageData]);

  return (
    <div>
      <Tag color="processing">{totalTime}</Tag>
    </div>
  );
};

export default OwnerSecondaryElement;
