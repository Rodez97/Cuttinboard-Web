import {
  Employee,
  Shift,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { useSchedule } from "@cuttinboard-solutions/cuttinboard-library/services";
import dayjs from "dayjs";
import React from "react";
import { useScheduler } from "./Scheduler";
import ShiftElement from "./ShiftElement";
import duration from "dayjs/plugin/duration";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { PlusOutlined } from "@ant-design/icons";
import { Space } from "antd";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(duration);

interface ShiftCellProps {
  employee: Employee;
  shifts?: Shift[];
  date: Date;
  onNewShift: (employee: Employee, date: Date) => void;
}

function ShiftCell({ employee, shifts, date, onNewShift }: ShiftCellProps) {
  const { isPublished } = useSchedule();

  const handleCellClick = () => {
    if (
      dayjs(date).isBefore(dayjs(dayjs().startOf("isoWeek"))) ||
      isPublished
    ) {
      return;
    }
    onNewShift(employee, date);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        justifyContent: "center",
      }}
    >
      {shifts?.length > 0 ? (
        <ShiftElement employee={employee} column={date} shifts={shifts} />
      ) : (
        <Space
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
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
