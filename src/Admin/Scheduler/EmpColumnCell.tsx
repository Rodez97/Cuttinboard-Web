/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  Employee,
  EmployeeShifts,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { useCallback } from "react";
import { QuickUserDialogAvatar } from "../../components/QuickUserDialog";
import { Card, Space, Tag, Tooltip, Typography } from "antd";
import { getDurationText } from "./getDurationText";
import {
  Colors,
  RoleAccessLevels,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { useSchedule } from "@cuttinboard-solutions/cuttinboard-library/services";

interface EmpColumnCellProps {
  employee: Employee;
  empShifts?: EmployeeShifts;
}

function EmpColumnCell({ employee, empShifts }: EmpColumnCellProps) {
  const { scheduleSettingsData } = useSchedule();
  const getSecondaryElement = useCallback(() => {
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

    const totalTime = getDurationText(empShifts.wageData.totalHours * 60);

    if (employee.locationRole === RoleAccessLevels.OWNER) {
      return <Tag color="processing">{totalTime}</Tag>;
    }

    const totalWage = empShifts.wageData.totalWage;

    const haveOvertime = empShifts.wageData.overtimeHours > 0;

    if (haveOvertime) {
      const overtimeTime = getDurationText(
        empShifts.wageData.overtimeHours * 60
      );
      const overtimeWage = empShifts.wageData.overtimeWage;

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
  }, [empShifts, employee, scheduleSettingsData]);

  return (
    <Card
      bordered={false}
      css={{
        zIndex: 2,
        backgroundColor:
          employee.locationRole === RoleAccessLevels.OWNER
            ? Colors.Yellow.Light
            : employee.locationRole === RoleAccessLevels.GENERAL_MANAGER
            ? Colors.Green.Light
            : Colors.Blue.Light,
        height: "100%",
      }}
    >
      <Card.Meta
        avatar={<QuickUserDialogAvatar employee={employee} size={25} />}
        title={`${employee.fullName}`}
        description={getSecondaryElement()}
      />
    </Card>
  );
}

export default EmpColumnCell;
