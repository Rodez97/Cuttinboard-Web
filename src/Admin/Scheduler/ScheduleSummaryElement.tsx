import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Statistic } from "antd/es";
import {
  Colors,
  getWeekSummary,
  minutesToTextDuration,
  useLocationPermissions,
  useSchedule,
  useWageData,
} from "@cuttinboard-solutions/cuttinboard-library";

function ScheduleSummaryElement() {
  const { t } = useTranslation();
  const wageData = useWageData();
  const { summaryDoc } = useSchedule();
  const {
    total: {
      totalHours,
      totalPeople,
      totalWage,
      laborPercentage,
      totalShifts,
      projectedSales,
    },
  } = useMemo(
    () => getWeekSummary(wageData, summaryDoc),
    [summaryDoc, wageData]
  );
  const checkPermission = useLocationPermissions();

  return (
    <div className="schedule-summary">
      {checkPermission("seeWages") && (
        <>
          <Statistic
            title={t("Est. Wages")}
            value={totalWage}
            prefix="$"
            precision={2}
          />
          <Statistic
            title={t("Labor %")}
            value={laborPercentage.toFixed(2)}
            suffix="%"
            precision={2}
          />
        </>
      )}

      <Statistic
        title={t("Scheduled Hours")}
        value={minutesToTextDuration(totalHours * 60)}
      />
      <Statistic title={t("People")} value={totalPeople} />
      <Statistic title={t("Shifts")} value={totalShifts} />

      <Statistic
        title={t("Projected Sales")}
        value={projectedSales}
        prefix="$"
        precision={2}
        valueStyle={{
          color: projectedSales <= 0 ? Colors.Error.errorMain : "initial",
        }}
      />
    </div>
  );
}

export default ScheduleSummaryElement;
