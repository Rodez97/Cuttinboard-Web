/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSchedule } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Divider, Space, Statistic } from "antd";
import { getDurationText } from "./getDurationText";

function ScheduleSummary() {
  const { t } = useTranslation();
  const {
    scheduleDocument,
    scheduleSummary: { totalHours, totalPeople, totalWage },
    employeeShiftsCollection,
  } = useSchedule();

  const getHours = useMemo(
    () => getDurationText(totalHours * 60),
    [totalHours]
  );

  const getProjectedSales = useMemo(() => {
    const percent = Object.values(scheduleDocument?.statsByDay ?? {}).reduce(
      (acc, { projectedSales }) => acc + (projectedSales ?? 0),
      0
    );
    return isFinite(percent) ? percent : 0;
  }, [scheduleDocument?.statsByDay]);

  const getLaborPercent = useMemo(() => {
    const percent = (totalWage / getProjectedSales) * 100;
    return isFinite(percent) ? percent : 0;
  }, [totalWage, getProjectedSales]);

  // Get total shifts
  const totalShifts = useMemo(() => {
    return employeeShiftsCollection?.reduce(
      (acc, { shiftsArray }) => acc + shiftsArray.length,
      0
    );
  }, [employeeShiftsCollection]);

  return (
    <Space
      size="large"
      wrap
      split={<Divider type="vertical" />}
      css={{ backgroundColor: "#00000010", padding: "5px 10px" }}
    >
      <Statistic
        title={t("Est. Wages")}
        value={totalWage}
        prefix="$"
        precision={2}
      />
      <Statistic title={t("Scheduled hours")} value={getHours} />
      <Statistic title={t("People")} value={totalPeople} />
      <Statistic title={t("Shifts")} value={totalShifts} />
      <Statistic
        title={t("Labor %")}
        value={getLaborPercent}
        suffix="%"
        precision={2}
      />
      <Statistic
        title={t("Projected Sales")}
        value={getProjectedSales}
        prefix="$"
        precision={2}
      />
    </Space>
  );
}

export default ScheduleSummary;
