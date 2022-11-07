/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  Employee,
  EmployeeShifts,
  Shift,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import dayjs from "dayjs";
import React from "react";
import ShiftElement from "./ShiftElement";
import duration from "dayjs/plugin/duration";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { PlusOutlined } from "@ant-design/icons";
import { Space } from "antd";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  Colors,
  RoleAccessLevels,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(duration);

interface ShiftCellProps {
  employee: Employee;
  shifts?: Shift[];
  date: Date;
  onNewShift: (employee: Employee, date: Date) => void;
  empShifts: EmployeeShifts;
}

function ShiftCell({
  employee,
  shifts,
  date,
  onNewShift,
  empShifts,
}: ShiftCellProps) {
  const handleCellClick = () => {
    onNewShift(employee, date);
  };

  return (
    <div
      css={{
        display: "flex",
        height: "100%",
        width: "100%",
        justifyContent: "center",
        backgroundColor:
          employee.locationRole === RoleAccessLevels.OWNER
            ? Colors.Yellow.Light
            : employee.locationRole === RoleAccessLevels.GENERAL_MANAGER
            ? Colors.Green.Light
            : Colors.Blue.Light,
      }}
    >
      {shifts?.length > 0 ? (
        <ShiftElement employee={employee} column={date} empShifts={empShifts} />
      ) : (
        <Space
          css={{
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
