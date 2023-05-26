/** @jsx jsx */
import { jsx } from "@emotion/react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Typography } from "antd/es";
import { useCallback } from "react";
import {
  minutesToTextDuration,
  useLocationPermissions,
  useSchedule,
  useWageData,
} from "@cuttinboard-solutions/cuttinboard-library";

function TableFooter() {
  const { t } = useTranslation();
  const { weekDays, summaryDoc } = useSchedule();
  const checkPermission = useLocationPermissions();
  const wageData = useWageData();

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
      const dayWageData = Object.values(wageData).map(
        (wd) => wd.summary[isoWeekDay]
      );

      dayWageData.forEach((dwd) => {
        if (dwd) {
          sum.totalHours += dwd.totalHours;
          sum.wages += dwd.totalWage;
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
    [summaryDoc?.projectedSalesByDay, wageData]
  );

  return (
    <tfoot>
      <tr>
        <th>{t("SCHEDULED HOURS")}</th>
        {weekDays.map((wd, i) => {
          return <td key={i + 1}>{cellData(wd).totalHours}</td>;
        })}
      </tr>
      {checkPermission("seeWages") && (
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
      )}
    </tfoot>
  );
}

export default TableFooter;
