import dayjs from "dayjs";
import React, { useMemo } from "react";
import duration from "dayjs/plugin/duration";
import { useSchedule } from "@cuttinboard-solutions/cuttinboard-library/services";
import { ShiftsTable } from "./Scheduler";
import { Space, Table, Typography } from "antd";
import isoWeek from "dayjs/plugin/isoWeek";
import { compact, isEmpty } from "lodash";
import { getDurationText } from "./getDurationText";
dayjs.extend(isoWeek);
dayjs.extend(duration);

interface SummaryCellProps {
  weekDay: Date;
  data: readonly ShiftsTable[];
  index: number;
}

export const SummaryCell = ({ index, weekDay, data }: SummaryCellProps) => {
  const { weekDays, employeeShiftsCollection, scheduleDocument } =
    useSchedule();

  const { totalHours, wages, laborPercent } = useMemo(() => {
    const columnShifts = compact(
      data.flatMap(({ empShifts }) =>
        empShifts?.shiftsArray.filter(
          (shift) => shift.shiftIsoWeekday === dayjs(weekDay).isoWeekday()
        )
      )
    );

    if (isEmpty(columnShifts)) {
      return {
        totalHours: `0h 0min`,
        wages: 0,
        laborPercent: "0.00%",
      };
    }

    const timeAndWages = columnShifts.reduce<{
      minutes: number;
      wage: number;
    }>(
      (acc, shift) => {
        const { minutes, wage } = acc;
        return {
          minutes: minutes + shift.shiftDuration.totalMinutes,
          wage: wage + shift.wageData.totalWage ?? 0,
        };
      },
      { minutes: 0, wage: 0 }
    );

    const totalHours = getDurationText(timeAndWages.minutes);

    const laborPercent = (() => {
      const wage = timeAndWages.wage ?? 0;
      const projectedSales =
        scheduleDocument?.statsByDay?.[dayjs(weekDay).isoWeekday()]
          ?.projectedSales ?? 0;
      const percent = (wage / projectedSales) * 100;
      return `${(isFinite(percent) ? percent : 0).toFixed(2)}%`;
    })();

    return {
      totalHours,
      wages: timeAndWages.wage ?? 0,
      laborPercent,
    };
  }, [weekDays, employeeShiftsCollection, scheduleDocument, data]);

  return (
    <Table.Summary.Cell index={index}>
      <Space direction="vertical" size="small">
        <Typography.Text>{totalHours}</Typography.Text>
        <Typography.Text>
          {wages.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
          {" - "}
          <b>({laborPercent})</b>
        </Typography.Text>
      </Space>
    </Table.Summary.Cell>
  );
};
