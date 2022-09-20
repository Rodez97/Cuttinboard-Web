import {
  MessageOutlined,
  OrderedListOutlined,
  RetweetOutlined,
} from "@ant-design/icons";
import { Employee, Shift } from "@cuttinboard/cuttinboard-library/models";
import { getShiftDate } from "@cuttinboard/cuttinboard-library/services";
import { Colors } from "@cuttinboard/cuttinboard-library/utils";
import styled from "@emotion/styled";
import { Space, Typography } from "antd";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import CellItemDialog from "./CellItemDialog";

interface ShiftElementProps {
  shifts: Shift[];
  employee: Employee;
  column: Date;
}

const PositionElement = styled(Typography.Text)`
  margin: 0px;
  color: #fff !important;
  font-size: 12px;
`;

function ShiftElement({ employee, column, shifts }: ShiftElementProps) {
  const [shiftsDialogOpen, setShiftsDialogOpen] = useState(false);
  const { t } = useTranslation();

  const handleClose = () => {
    setShiftsDialogOpen(false);
  };
  const handleShiftClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation();
    setShiftsDialogOpen(true);
  };

  return (
    <>
      <Space
        onClick={handleShiftClick}
        style={{
          cursor: "pointer",
          width: "100%",
          backgroundColor: Colors.MainBlue,
        }}
        direction="vertical"
      >
        {shifts[0]?.position && (
          <div
            style={{
              backgroundColor: Colors.MainDark,
              padding: 1,
              textAlign: "center",
            }}
          >
            <PositionElement type="secondary">
              {t(shifts[0]?.position)}
            </PositionElement>
          </div>
        )}
        <Space direction="vertical" style={{ display: "flex" }}>
          <Typography
            style={{
              justifyContent: "center",
              display: "flex",
              color: "white",
            }}
          >{`${getShiftDate(shifts[0].start)
            .format("h:mma")
            .replace("m", "")} - ${getShiftDate(shifts[0].end)
            .format("h:mma")
            .replace("m", "")}`}</Typography>
          <Space style={{ justifyContent: "space-evenly", display: "flex" }}>
            {Object.keys(shifts[0]?.tasks ?? {}).length > 0 && (
              <OrderedListOutlined style={{ color: "white" }} />
            )}
            {shifts[0]?.notes && <MessageOutlined style={{ color: "white" }} />}
          </Space>
          <Space style={{ justifyContent: "space-evenly", display: "flex" }}>
            {shifts[0]?.altId === "repeat" && (
              <RetweetOutlined style={{ color: "white" }} />
            )}
            {shifts.length > 1 && (
              <Typography style={{ color: "white" }}>{`+${
                shifts.length - 1
              }`}</Typography>
            )}
          </Space>
        </Space>
      </Space>
      <CellItemDialog
        column={column}
        open={shiftsDialogOpen}
        shifts={shifts}
        onClose={handleClose}
        employee={employee}
      />
    </>
  );
}

export default ShiftElement;
