/** @jsx jsx */
import { css, jsx } from "@emotion/react";
import Icon, { MessageOutlined, OrderedListOutlined } from "@ant-design/icons";
import {
  Employee,
  EmployeeShifts,
  Shift,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import styled from "@emotion/styled";
import { Badge, Space, Tag, Tooltip, Typography } from "antd";
import { isEmpty } from "lodash";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import CellItemDialog from "./CellItemDialog";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { getDurationText } from "./getDurationText";
import mdiClockAlert from "@mdi/svg/svg/clock-alert.svg";
dayjs.extend(isBetween);

interface ShiftElementProps {
  employee: Employee;
  column: Date;
  empShifts: EmployeeShifts;
}

const PositionElement = styled(Typography.Text)`
  margin: 0px;
  color: #fff !important;
  font-size: 12px;
`;

const BaseContainerStyle = css`
  cursor: pointer;
  min-width: 130px !important;
  width: 100% !important;
  height: 100%;
  background-color: ${Colors.MainBlue};
  color: ${Colors.CalculateContrast(Colors.MainBlue)} !important;
`;

const DeletingStyle = css`
  background: repeating-linear-gradient(
    -45deg,
    #f33d61,
    #f33d61 10px,
    #e76e8a 10px,
    #e76e8a 20px
  );
  color: ${Colors.CalculateContrast("#f33d61")} !important;
`;

const DraftOrEditedStyle = css`
  background: repeating-linear-gradient(
    -45deg,
    #606060,
    #606060 10px,
    #505050 10px,
    #505050 20px
  );
  color: ${Colors.CalculateContrast("#606060")} !important;
`;

function ShiftElement({ employee, column, empShifts }: ShiftElementProps) {
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
    // Get the shifts for the current employee and the current column
    const shifts = empShifts.shiftsArray.filter(
      (s) => s.shiftIsoWeekday === dayjs(column).isoWeekday()
    );

    // order the shift by start time and get the first one
    const shift = shifts[0];

    let time = "";
    let shiftPosition = "";
    let hasTasks = false;
    let hasNotes = false;
    let wage = 0;
    const shiftsCount = shifts.length;
    if (shift.hasPendingUpdates) {
      const { start, end, tasks, notes, position } = shift.pendingUpdate;
      time = `${Shift.toDate(start)
        .format("h:mma")
        .replace("m", "")} - ${Shift.toDate(end)
        .format("h:mma")
        .replace("m", "")}`;
      shiftPosition = position;
      hasTasks = !isEmpty(tasks);
      hasNotes = Boolean(notes);
      wage = shift.hourlyWage ?? 0;
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
    return {
      time,
      shiftPosition,
      hasTasks,
      hasNotes,
      shiftsCount,
      wage,
      shift,
      shifts,
    };
  }, []);

  // Check if some of the shifts are over the hours limit for the employee on a week basis
  const isOverHours = useMemo(() => {
    return getShiftData.shifts.some((shift) => {
      return shift.wageData.overtimeHours > 0;
    });
  }, [getShiftData.shifts]);

  // Get Wage Tag
  const getWageTag = useMemo(() => {
    const { wageData, hourlyWage } = getShiftData.shift;
    if (wageData.overtimeHours > 0) {
      const overtimeTime = getDurationText(wageData.overtimeHours * 60);
      return (
        <Tooltip
          title={
            <Space direction="vertical">
              <Typography.Text
                css={{ color: "inherit" }}
              >{`OT: ${overtimeTime}`}</Typography.Text>
              <Typography.Text css={{ color: "inherit" }}>{`OT pay: ${Number(
                wageData.overtimeWage
              ).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}`}</Typography.Text>
            </Space>
          }
        >
          <Tag color="warning">
            {hourlyWage.toLocaleString("EN-us", {
              style: "currency",
              currency: "USD",
            }) + "/hr"}
          </Tag>
        </Tooltip>
      );
    }
    return (
      <Tag color={hourlyWage > 0 ? "processing" : "error"}>
        {hourlyWage.toLocaleString("EN-us", {
          style: "currency",
          currency: "USD",
        }) + "/hr"}
      </Tag>
    );
  }, [getShiftData]);

  const ExtraIcons = useMemo(() => {
    if (getShiftData.hasTasks || getShiftData.hasNotes) {
      return (
        <Space style={{ display: "flex" }}>
          {getShiftData.hasTasks && (
            <OrderedListOutlined style={{ color: "inherit" }} />
          )}
          {getShiftData.hasNotes && (
            <MessageOutlined style={{ color: "inherit" }} />
          )}
        </Space>
      );
    }
    return undefined;
  }, [getShiftData]);

  const AlertIcons = useMemo(() => {
    if (isOverHours) {
      return (
        <Tooltip title={t("Overtime")} placement="topRight">
          <Icon
            component={mdiClockAlert}
            css={{ color: Colors.Error.errorMain }}
          />
        </Tooltip>
      );
    }
    return undefined;
  }, [isOverHours]);

  const SecondRow = useMemo(
    () => (
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
        {getWageTag}

        {AlertIcons}
      </div>
    ),
    [getWageTag, AlertIcons]
  );

  const ExtraShifts = useMemo(() => {
    if (getShiftData.shiftsCount > 1) {
      return <Badge count={`+${getShiftData.shiftsCount - 1}`} size="small" />;
    }
    return undefined;
  }, [getShiftData.shiftsCount]);

  const FirstRow = useMemo(
    () => (
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
    ),
    [getShiftData, ExtraShifts]
  );

  return (
    <React.Fragment>
      <Space
        onClick={handleShiftClick}
        direction="vertical"
        css={[
          BaseContainerStyle,
          Boolean(getShiftData.shift.deleting)
            ? DeletingStyle
            : Boolean(
                getShiftData.shift.status === "draft" ||
                  getShiftData.shift.hasPendingUpdates
              )
            ? DraftOrEditedStyle
            : undefined,
        ]}
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
            (ExtraIcons || ExtraShifts) && (
              <div
                css={{
                  backgroundColor: Colors.MainDark,
                  flexDirection: "row",
                  padding: 5,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                {AlertIcons}
                <div />
                {ExtraShifts}
              </div>
            )
          )
        ) : null}

        <div
          css={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          <Typography.Text
            css={{
              color: "inherit",
              textAlign: "center",
              fontWeight: "700",
              fontSize: 12,
            }}
          >
            {getShiftData.time}
          </Typography.Text>

          {ExtraIcons}
        </div>
      </Space>
      <CellItemDialog
        column={column}
        open={shiftsDialogOpen}
        shifts={getShiftData.shifts}
        onClose={handleClose}
        employee={employee}
      />
    </React.Fragment>
  );
}

export default ShiftElement;
