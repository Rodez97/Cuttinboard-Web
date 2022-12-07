/** @jsx jsx */
import { jsx } from "@emotion/react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import duration from "dayjs/plugin/duration";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { ShiftsTable } from "./Scheduler";
import { Table, Typography } from "antd";
import React, { useCallback } from "react";
import {
  minutesToTextDuration,
  useSchedule,
} from "@cuttinboard-solutions/cuttinboard-library/schedule";
dayjs.extend(advancedFormat);
dayjs.extend(duration);

function TableFooter({ data }: { data: readonly ShiftsTable[] }) {
  const { t } = useTranslation();
  const { weekDays, scheduleDocument } = useSchedule();

  const cellData = useCallback(
    (weekDay: Date) => {
      const summ: {
        totalHours: number;
        wages: number;
        laborPercent: number;
      } = {
        totalHours: 0,
        wages: 0,
        laborPercent: 0,
      };

      const isoWeekDay = dayjs(weekDay).isoWeekday();

      data?.forEach(({ empShifts }) => {
        const shift = empShifts?.wageData?.[isoWeekDay];
        if (shift) {
          summ.totalHours += shift.totalHours;
          summ.wages += shift.totalWage;
        }
      });

      const totalHoursText = minutesToTextDuration(summ.totalHours * 60);

      const projectedSales =
        scheduleDocument?.projectedSalesByDay?.[isoWeekDay] ?? 0;

      const laborPercent = (summ.wages / projectedSales) * 100;

      return {
        totalHours: totalHoursText,
        wages: summ.wages,
        laborPercent: `${(isFinite(laborPercent) ? laborPercent : 0).toFixed(
          2
        )}%`,
      };
    },
    [scheduleDocument, data]
  );

  return (
    <React.Fragment>
      <Table.Summary.Row>
        <Table.Summary.Cell
          index={0}
          css={{
            fontWeight: "bold",
          }}
        >
          {t("SCHEDULED HOURS")}
        </Table.Summary.Cell>
        {weekDays.map((wd, i) => {
          return (
            <Table.Summary.Cell index={i + 1} key={i + 1}>
              {cellData(wd).totalHours}
            </Table.Summary.Cell>
          );
        })}
      </Table.Summary.Row>
      <Table.Summary.Row>
        <Table.Summary.Cell
          index={0}
          css={{
            fontWeight: "bold",
          }}
        >
          {t("LABOR COST")}
        </Table.Summary.Cell>
        {weekDays.map((wd, i) => {
          return (
            <Table.Summary.Cell index={i + 1} key={i + 1}>
              <Typography.Text>
                {cellData(wd).wages.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
                {" - "}
                <b>({cellData(wd).laborPercent})</b>
              </Typography.Text>
            </Table.Summary.Cell>
          );
        })}
      </Table.Summary.Row>
    </React.Fragment>
  );
}

export default TableFooter;
