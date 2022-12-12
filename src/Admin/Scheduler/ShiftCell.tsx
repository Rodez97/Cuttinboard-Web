/** @jsx jsx */
import { jsx } from "@emotion/react";
import dayjs from "dayjs";
import ShiftElement from "./ShiftElement";
import duration from "dayjs/plugin/duration";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { PlusOutlined } from "@ant-design/icons";
import { Space } from "antd";
import isoWeek from "dayjs/plugin/isoWeek";
import { useScheduler } from "./Scheduler";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/employee";
import { Shift } from "@cuttinboard-solutions/cuttinboard-library/schedule";
import { useMemo } from "react";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(duration);

interface ShiftCellProps {
  employee: Employee;
  allShifts?: Shift[];
  date: Date;
}

function ShiftCell({ employee, allShifts, date }: ShiftCellProps) {
  const { newShift } = useScheduler();
  const handleCellClick = () => {
    newShift(employee, date);
  };

  const cellShifts = useMemo(
    () =>
      allShifts?.filter((s) => s.shiftIsoWeekday === dayjs(date).isoWeekday()),
    [allShifts, date]
  );

  console.log("cellShifts", cellShifts);

  return (
    <div
      css={{
        display: "flex",
        height: "100%",
        width: "100%",
        flexDirection: "column",
      }}
    >
      {cellShifts && cellShifts.length > 0 ? (
        cellShifts.map((shift) => (
          <ShiftElement
            key={shift.id}
            employee={employee}
            column={date}
            shift={shift}
          />
        ))
      ) : (
        <Space
          css={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            cursor: "pointer",
          }}
          onClick={handleCellClick}
        >
          <PlusOutlined />
        </Space>
      )}
    </div>
  );
}

export default ShiftCell;
