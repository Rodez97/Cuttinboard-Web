/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useTranslation } from "react-i18next";
import { useSchedule } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Divider, Space, Statistic } from "antd";
import { getDurationText } from "./getDurationText";

function ScheduleSummaryElement() {
  const { t } = useTranslation();
  const {
    scheduleSummary: {
      totalHours,
      totalPeople,
      totalWage,
      laborPercentage,
      totalShifts,
      projectedSales,
    },
  } = useSchedule();

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
      <Statistic
        title={t("Scheduled hours")}
        value={getDurationText(totalHours * 60)}
      />
      <Statistic title={t("People")} value={totalPeople} />
      <Statistic title={t("Shifts")} value={totalShifts} />
      <Statistic
        title={t("Labor %")}
        value={laborPercentage}
        suffix="%"
        precision={2}
      />
      <Statistic
        title={t("Projected Sales")}
        value={projectedSales}
        prefix="$"
        precision={2}
      />
    </Space>
  );
}

export default ScheduleSummaryElement;
