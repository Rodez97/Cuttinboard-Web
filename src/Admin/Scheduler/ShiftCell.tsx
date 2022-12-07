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
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(duration);

interface ShiftCellProps {
  employee: Employee;
  shifts?: Shift[];
  date: Date;
}

function ShiftCell({ employee, shifts, date }: ShiftCellProps) {
  const { newShift } = useScheduler();
  const handleCellClick = () => {
    newShift?.(employee, date);
  };

  return (
    <div
      css={{
        display: "flex",
        height: "100%",
        width: "100%",
        flexDirection: "column",
      }}
    >
      {shifts && shifts.length > 0 ? (
        shifts.map((shift) => (
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
