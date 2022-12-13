/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useMemo } from "react";
import { Space, Tag, Tooltip, Typography } from "antd";
import { RoleAccessLevels } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { UserInfoAvatar } from "../../shared";
import { Employee } from "@cuttinboard-solutions/cuttinboard-library/employee";
import {
  EmployeeShifts,
  minutesToTextDuration,
} from "@cuttinboard-solutions/cuttinboard-library/schedule";

interface EmpColumnCellProps {
  employee: Employee;
  empShifts?: EmployeeShifts;
}

function EmpColumnCell({ employee, empShifts }: EmpColumnCellProps) {
  const SecondaryElement = useMemo(() => {
    if (!empShifts) {
      if (employee.locationRole === RoleAccessLevels.OWNER) {
        return <Tag color="processing">{`${0}h ${0}min`}</Tag>;
      }

      return (
        <Tag color="processing">{`${0}h ${0}min - ${Number(0).toLocaleString(
          "en-US",
          {
            style: "currency",
            currency: "USD",
          }
        )}`}</Tag>
      );
    }

    const totalTime = minutesToTextDuration(empShifts.summary.totalHours * 60);

    if (employee.locationRole === RoleAccessLevels.OWNER) {
      return <Tag color="processing">{totalTime}</Tag>;
    }

    const totalWage = empShifts.summary.totalWage;

    const haveOvertime = empShifts.summary.overtimeHours > 0;

    if (haveOvertime) {
      const overtimeTime = minutesToTextDuration(
        empShifts.summary.overtimeHours * 60
      );
      const overtimeWage = empShifts.summary.overtimeWage;

      return (
        <Tooltip
          title={
            <Space direction="vertical">
              <Typography.Text
                css={{ color: "inherit" }}
              >{`OT: ${overtimeTime}`}</Typography.Text>
              <Typography.Text css={{ color: "inherit" }}>{`OT pay: ${Number(
                overtimeWage
              ).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}`}</Typography.Text>
            </Space>
          }
        >
          <Tag color="error">{`${totalTime} - ${totalWage.toLocaleString(
            "en-US",
            {
              style: "currency",
              currency: "USD",
            }
          )}`}</Tag>
        </Tooltip>
      );
    }

    return (
      <Tag color="processing">{`${totalTime} - ${totalWage.toLocaleString(
        "en-US",
        {
          style: "currency",
          currency: "USD",
        }
      )}`}</Tag>
    );
  }, [empShifts, employee]);

  return (
    <div
      css={{
        backgroundColor: "white",
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        css={{
          zIndex: 2,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          height: 50,
          paddingLeft: 5,
          backgroundColor: "white",
        }}
      >
        <UserInfoAvatar employee={employee} size={25} />
        <div css={{ marginLeft: 5, display: "flex", flexDirection: "column" }}>
          <Typography.Text strong>{employee.fullName}</Typography.Text>
          {SecondaryElement}
        </div>
      </div>
    </div>
  );
}

export default EmpColumnCell;
