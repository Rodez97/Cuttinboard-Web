import dayjs from "dayjs";
import { uniqBy } from "lodash";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import duration from "dayjs/plugin/duration";
import {
  getShiftDate,
  useSchedule,
} from "@cuttinboard/cuttinboard-library/services";
import { ShiftsTable } from "./Scheduler";
import { Space, Table, Typography } from "antd";

interface SummaryCellProps {
  key: number;
  weekDay: Date;
  data: readonly ShiftsTable[];
}
export const SummaryCell = ({ key, weekDay, data }: SummaryCellProps) => {
  const { t } = useTranslation();
  const { weekDays, shiftsCollection, scheduleDocument } = useSchedule();

  const { totalHours, totalEmployees, timeAndWages, laborPercent } =
    useMemo(() => {
      const columnShifts = data.flatMap(({ shifts }) =>
        shifts.filter(
          (shift) => getShiftDate(shift.start).day() === weekDay.getDay()
        )
      );

      const timeAndWages = columnShifts?.reduce<{
        time: duration.Duration;
        wage: number;
      }>(
        (acc, shift) => {
          const start = getShiftDate(shift.start);
          const end = getShiftDate(shift.end);
          const duration = end.diff(start, "minutes");
          const { time, wage } = acc;
          return {
            time: time.add(duration, "minutes"),
            wage: wage + (shift.hourlyWage ?? 0) * (duration / 60),
          };
        },
        { time: dayjs.duration(0), wage: 0 }
      ) ?? { time: dayjs.duration(0), wage: 0 };

      const totalHours = (() => {
        const totalTime = timeAndWages.time.asHours().toString().split(".");
        const hours = `${totalTime[0] ?? "0"}h`;
        const minutes = `${
          60 * (Number.parseInt(totalTime[1] ?? "0") / 10)
        }min`;
        return `${hours} ${minutes}`;
      })();

      const totalEmployees =
        uniqBy(columnShifts, (cs) => cs.employeeId).length ?? 0;

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
        totalEmployees,
        timeAndWages,
        laborPercent,
      };
    }, [weekDays, shiftsCollection, scheduleDocument, data]);

  return (
    <Table.Summary.Cell key={key} index={key}>
      <Space direction="vertical" size="small">
        <Typography.Text>{totalHours}</Typography.Text>
        <Typography.Text>{`${totalEmployees} ${t(
          "employees"
        )}`}</Typography.Text>
        <Typography.Text>
          {timeAndWages.wage.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </Typography.Text>
        <Typography.Text>{laborPercent}</Typography.Text>
      </Space>
    </Table.Summary.Cell>
  );
};
