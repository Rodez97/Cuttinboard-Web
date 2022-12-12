/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useTranslation } from "react-i18next";
import { Divider, Space, Statistic } from "antd";
import {
  minutesToTextDuration,
  useSchedule,
} from "@cuttinboard-solutions/cuttinboard-library/schedule";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";

function ScheduleSummaryElement() {
  const { t } = useTranslation();
  const {
    weekSummary: {
      total: {
        totalHours,
        totalPeople,
        totalWage,
        laborPercentage,
        totalShifts,
        projectedSales,
      },
    },
  } = useSchedule();

  return (
    <Space
      size="large"
      wrap
      split={<Divider type="vertical" />}
      css={{ backgroundColor: "#FCFCFC", padding: "5px 10px" }}
    >
      <Statistic
        title={t("Est. Wages")}
        value={totalWage}
        prefix="$"
        precision={2}
      />
      <Statistic
        title={t("Scheduled hours")}
        value={minutesToTextDuration(totalHours * 60)}
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
        valueStyle={{
          color: projectedSales <= 0 ? Colors.Error.errorMain : "initial",
        }}
      />
    </Space>
  );
}

export default ScheduleSummaryElement;
