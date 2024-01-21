import React from "react";
import dayjs from "dayjs";
import ShiftElement from "./ShiftElement";
import { PlusOutlined } from "@ant-design/icons";
import isoWeek from "dayjs/plugin/isoWeek";
import { useMemo } from "react";
import {
  IEmployee,
  IShift,
  getShiftDayjsDate,
  getShiftIsoWeekday,
} from "@rodez97/types-helpers";
dayjs.extend(isoWeek);

export interface ManageShiftsProps {
  editShift: (employee: IEmployee, shift: IShift) => void;
  newShift: (employee: IEmployee, date: dayjs.Dayjs) => void;
}

interface ShiftCellProps extends ManageShiftsProps {
  employee: IEmployee;
  allShifts?: IShift[];
  column: dayjs.Dayjs;
}

function ShiftCell({
  employee,
  allShifts,
  column,
  newShift,
  editShift,
}: ShiftCellProps) {
  const handleCellClick = () => {
    newShift(employee, column);
  };

  const cellShifts = useMemo(() => {
    if (!allShifts) {
      return [];
    }
    return allShifts
      .filter((s) => getShiftIsoWeekday(s) === column.isoWeekday())
      .sort((a, b) => {
        const aStart = getShiftDayjsDate(a, "start");
        const bStart = getShiftDayjsDate(b, "start");
        if (aStart.isBefore(bStart)) return -1;
        if (aStart.isAfter(bStart)) return 1;
        return 0;
      });
  }, [allShifts, column]);

  return (
    <div className="shift-cell-container">
      {cellShifts && cellShifts.length > 0 ? (
        cellShifts.map((shift, index) => (
          <ShiftElement
            key={shift.id}
            {...{ editShift, newShift, employee, shift, column, index }}
          />
        ))
      ) : (
        <div
          className="shift-cell-container__add-shift"
          onClick={handleCellClick}
        >
          <PlusOutlined />
        </div>
      )}
    </div>
  );
}

export default ShiftCell;
