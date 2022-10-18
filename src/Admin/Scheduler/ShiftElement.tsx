import { MessageOutlined, OrderedListOutlined } from "@ant-design/icons";
import {
  Employee,
  Shift,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { getShiftDate } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import styled from "@emotion/styled";
import { Space, Typography } from "antd";
import { isEmpty } from "lodash";
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

const Container = styled(Space)<{
  $draftoredited: boolean;
  $deleting: boolean;
}>`
  cursor: pointer;
  width: 100%;
  height: 100%;
  background: ${(props) =>
    props.$deleting
      ? `repeating-linear-gradient(-45deg, #f33d61, #f33d61 10px, #e76e8a 10px, #e76e8a 20px)`
      : props.$draftoredited &&
        `repeating-linear-gradient(-45deg, #606060, #606060 10px, #505050 10px, #505050 20px)`};
  background-color: ${(props) =>
    !props.$draftoredited && !props.$deleting && Colors.MainBlue};
  color: ${(props) => {
    if (props.$deleting) {
      return Colors.CalculateContrast("#f33d61");
    }
    if (props.$draftoredited) {
      return Colors.CalculateContrast("#606060");
    }
    return Colors.CalculateContrast(Colors.MainBlue);
  }} !important;
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

  const getShiftData = (shift: Shift = shifts[0]) => {
    let time = "";
    let shiftPosition = "";
    let hasTasks = false;
    let hasNotes = false;
    const shiftsCount = shifts.length;
    if (shift.hasPendingUpdates) {
      const { start, end, tasks, notes, position } = shift.pendingUpdate;
      time = `${getShiftDate(start)
        .format("h:mma")
        .replace("m", "")} - ${getShiftDate(end)
        .format("h:mma")
        .replace("m", "")}`;
      shiftPosition = position;
      hasTasks = !isEmpty(tasks);
      hasNotes = Boolean(notes);
    } else {
      time = `${shift.getStartDayjsDate
        .format("h:mma")
        .replace("m", "")} - ${shift.getEndDayjsDate
        .format("h:mma")
        .replace("m", "")}`;
      shiftPosition = shift.position;
      hasTasks = !isEmpty(shift.tasks);
      hasNotes = Boolean(shift.notes);
    }
    return { time, shiftPosition, hasTasks, hasNotes, shiftsCount };
  };

  return (
    <>
      <Container
        onClick={handleShiftClick}
        direction="vertical"
        $draftoredited={Boolean(
          shifts[0].status === "draft" || shifts[0].hasPendingUpdates
        )}
        $deleting={Boolean(shifts[0].deleting)}
      >
        {getShiftData()?.shiftPosition && (
          <div
            style={{
              backgroundColor: Colors.MainDark,
              padding: 1,
              textAlign: "center",
            }}
          >
            <PositionElement type="secondary">
              {getShiftData().shiftPosition}
            </PositionElement>
          </div>
        )}
        <Space direction="vertical" style={{ display: "flex" }}>
          <Typography
            style={{
              justifyContent: "center",
              display: "flex",
              color: "inherit",
            }}
          >
            {getShiftData().time}
          </Typography>
          <Space style={{ justifyContent: "space-evenly", display: "flex" }}>
            {getShiftData().hasTasks && (
              <OrderedListOutlined style={{ color: "inherit" }} />
            )}
            {getShiftData().hasNotes && (
              <MessageOutlined style={{ color: "inherit" }} />
            )}
          </Space>
          <Space style={{ justifyContent: "space-evenly", display: "flex" }}>
            {getShiftData().shiftsCount > 1 && (
              <Typography style={{ color: "inherit" }}>{`+${
                getShiftData().shiftsCount - 1
              }`}</Typography>
            )}
          </Space>
        </Space>
      </Container>
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
