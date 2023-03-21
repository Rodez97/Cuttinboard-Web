/** @jsx jsx */
import { jsx } from "@emotion/react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { ShiftsTable } from "./Scheduler";
import { Typography } from "antd";
import { useCallback } from "react";
import { useSchedule } from "@cuttinboard-solutions/cuttinboard-library";
import { minutesToTextDuration } from "@cuttinboard-solutions/types-helpers";

function TableFooter({ data }: { data: readonly ShiftsTable[] }) {
  const { t } = useTranslation();
  const { weekDays, summaryDoc, wageData } = useSchedule();

  const cellData = useCallback(
    (weekDay: dayjs.Dayjs) => {
      const sum: {
        totalHours: number;
        wages: number;
        laborPercent: number;
      } = {
        totalHours: 0,
        wages: 0,
        laborPercent: 0,
      };

      const isoWeekDay = weekDay.isoWeekday();

      data?.forEach(({ shifts, employee }) => {
        if (shifts) {
          const weekData = wageData?.[employee.id]?.summary;
          const shiftWage = weekData?.[isoWeekDay];
          if (shiftWage) {
            sum.totalHours += shiftWage.totalHours;
            sum.wages += shiftWage.totalWage;
          }
        }
      });

      const totalHoursText = minutesToTextDuration(sum.totalHours * 60);

      const projectedSales = summaryDoc?.projectedSalesByDay?.[isoWeekDay] ?? 0;

      const laborPercent = (sum.wages / projectedSales) * 100;

      return {
        totalHours: totalHoursText,
        wages: sum.wages,
        laborPercent: `${(isFinite(laborPercent) ? laborPercent : 0).toFixed(
          2
        )}%`,
      };
    },
    [data, summaryDoc?.projectedSalesByDay, wageData]
  );

  return (
    <tfoot>
      <tr>
        <th>{t("SCHEDULED HOURS")}</th>
        {weekDays.map((wd, i) => {
          return <td key={i + 1}>{cellData(wd).totalHours}</td>;
        })}
      </tr>
      <tr>
        <th>{t("LABOR COST")}</th>
        {weekDays.map((wd, i) => {
          const { wages, laborPercent } = cellData(wd);
          return (
            <td key={i + 1}>
              <Typography.Text>
                {wages.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
                {" - "}
                <b>({laborPercent})</b>
              </Typography.Text>
            </td>
          );
        })}
      </tr>
    </tfoot>
  );
}

export default TableFooter;
