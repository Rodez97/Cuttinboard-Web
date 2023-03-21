import React from "react";
import { Typography } from "antd";
import EmployeeSecondaryElement from "./EmployeeSecondaryElement";
import OwnerSecondaryElement from "./OwnerSecondaryElement";
import CuttinboardAvatar from "../../shared/atoms/Avatar";
import {
  getEmployeeFullName,
  IEmployee,
  IShift,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";

interface EmpColumnCellProps {
  employee: IEmployee;
  empShifts?: IShift[];
}

function EmpColumnCell({ employee, empShifts }: EmpColumnCellProps) {
  return (
    <div className="employee-cell">
      <div className="employee-cell__content">
        <CuttinboardAvatar
          size={25}
          src={employee?.avatar}
          userId={employee.id}
        />
        <div className="employee-cell__content__secondary">
          <Typography.Text
            strong
            className="employee-cell__content__secondary__name"
          >
            {getEmployeeFullName(employee)}
          </Typography.Text>
          {employee.role === RoleAccessLevels.OWNER ? (
            <OwnerSecondaryElement
              empShifts={empShifts}
              employeeId={employee.id}
            />
          ) : (
            <EmployeeSecondaryElement
              empShifts={empShifts}
              employeeId={employee.id}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default EmpColumnCell;
