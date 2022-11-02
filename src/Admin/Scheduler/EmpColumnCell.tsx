/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  Employee,
  EmployeeShifts,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { useCallback } from "react";
import { QuickUserDialogAvatar } from "../../components/QuickUserDialog";
import { Card } from "antd";
import { getDurationText } from "./getDurationText";
import {
  Colors,
  RoleAccessLevels,
} from "@cuttinboard-solutions/cuttinboard-library/utils";

interface EmpColumnCellProps {
  employee: Employee;
  empShifts?: EmployeeShifts;
}

function EmpColumnCell({ employee, empShifts }: EmpColumnCellProps) {
  const getSecondaryText = useCallback(() => {
    if (!empShifts) {
      return `${0}h ${0}min - ${Number(0).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })}`;
    }

    const totalTime = getDurationText(empShifts.userSummary.totalHours * 60);
    return `${totalTime} - ${empShifts.userSummary.totalWage.toLocaleString(
      "en-US",
      {
        style: "currency",
        currency: "USD",
      }
    )}`;
  }, [empShifts]);

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
      }}
    >
      <Card.Meta
        avatar={<QuickUserDialogAvatar employee={employee} />}
        title={`${employee.fullName}`}
        description={getSecondaryText()}
      />
    </Card>
  );
}

export default EmpColumnCell;
