/** @jsx jsx */
import { jsx } from "@emotion/react";
import { MessageOutlined, OrderedListOutlined } from "@ant-design/icons";
import {
  Employee,
  Shift,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { getShiftDate } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import styled from "@emotion/styled";
import { Badge, Space, Tag, Typography } from "antd";
import { isEmpty, orderBy } from "lodash";
import React, { useMemo, useState } from "react";
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
  min-width: 130px !important;
  width: calc((100vw - 250px) / 7) !important;
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

  const getShiftData = useMemo(() => {
    // order the shift by start time and get the first one
    const shift = orderBy(shifts, (e) => e.getStartDayjsDate, ["asc"])[0];

    let time = "";
    let shiftPosition = "";
    let hasTasks = false;
    let hasNotes = false;
    let wage = 0;
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
      wage = shift.hourlyWage ?? 0;
    }
    return { time, shiftPosition, hasTasks, hasNotes, shiftsCount, wage };
  }, [shifts]);

  const ExtraIcons = (
    <Space style={{ display: "flex" }}>
      {getShiftData.hasTasks && (
        <OrderedListOutlined style={{ color: "inherit" }} />
      )}
      {getShiftData.hasNotes && (
        <MessageOutlined style={{ color: "inherit" }} />
      )}
    </Space>
  );
  const SecondRow = (
    <div
      css={{
        backgroundColor: Colors.MainDark,
        padding: 5,
        flexDirection: "row",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Tag color={getShiftData.wage > 0 ? "processing" : "error"}>
        {getShiftData.wage.toLocaleString("EN-us", {
          style: "currency",
          currency: "USD",
        }) + "/hr"}
      </Tag>

      {ExtraIcons}
    </div>
  );
  const ExtraShifts = getShiftData.shiftsCount > 1 && (
    <Badge count={`+${getShiftData.shiftsCount - 1}`} size="small" />
  );
  const FirstRow = (
    <div
      css={{
        backgroundColor: Colors.MainDark,
        padding: 5,
        flexDirection: "row",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
      }}
    >
      {getShiftData?.shiftPosition ? (
        <PositionElement type="secondary" ellipsis>
          {getShiftData.shiftPosition}
        </PositionElement>
      ) : (
        <Tag color="error">{t("No position")}</Tag>
      )}

      {ExtraShifts}
    </div>
  );
  return (
    <React.Fragment>
      <Container
        onClick={handleShiftClick}
        direction="vertical"
        $draftoredited={Boolean(
          shifts[0].status === "draft" || shifts[0].hasPendingUpdates
        )}
        $deleting={Boolean(shifts[0].deleting)}
      >
        {employee.locationRole > 2 && (
          <div>
            {FirstRow}
            {SecondRow}
          </div>
        )}

        {employee.locationRole === 2 ? (
          getShiftData.shiftPosition ? (
            <div>
              {FirstRow}
              {SecondRow}
            </div>
          ) : (
            <div
              css={{
                backgroundColor: Colors.MainDark,
                flexDirection: "row",
                padding: "0px 7px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
              }}
            >
              {ExtraIcons}
              {ExtraShifts}
            </div>
          )
        ) : null}

        <Typography.Text
          css={{
            color: "inherit",
            textAlign: "center",
            width: "100%",
            display: "block",
          }}
        >
          {getShiftData.time}
        </Typography.Text>
      </Container>
      <CellItemDialog
        column={column}
        open={shiftsDialogOpen}
        shifts={shifts}
        onClose={handleClose}
        employee={employee}
      />
    </React.Fragment>
  );
}

export default ShiftElement;
