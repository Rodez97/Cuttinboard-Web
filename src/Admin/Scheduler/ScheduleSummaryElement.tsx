import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button, Descriptions, Modal, Statistic } from "antd/es";
import {
  Colors,
  getWeekSummary,
  minutesToTextDuration,
  useLocationPermissions,
  useSchedule,
  useWageData,
} from "@cuttinboard-solutions/cuttinboard-library";
import { useMediaQuery } from "@react-hook/media-query";

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
  const matches = useMediaQuery("only screen and (max-width: 992px)");

  const showInDialog = () => {
    Modal.info({
      title: t("Schedule Summary"),
      content: (
        <Descriptions bordered size="small" layout="horizontal" column={1}>
          {checkPermission("seeWages") && (
            <>
              <Descriptions.Item label={t("Est. Wages")}>
                {"$" + totalWage.toFixed(2)}
              </Descriptions.Item>

              <Descriptions.Item label={t("Labor %")}>
                {laborPercentage.toFixed(2) + "%"}
              </Descriptions.Item>
            </>
          )}

          <Descriptions.Item label={t("Scheduled Hours")}>
            {minutesToTextDuration(totalHours * 60)}
          </Descriptions.Item>

          <Descriptions.Item label={t("People")}>
            {totalPeople}
          </Descriptions.Item>

          <Descriptions.Item label={t("Shifts")}>
            {totalShifts}
          </Descriptions.Item>

          <Descriptions.Item
            label={t("Projected Sales")}
            contentStyle={{
              color: projectedSales <= 0 ? Colors.Error.errorMain : "initial",
            }}
          >
            {"$" + projectedSales.toFixed(2)}
          </Descriptions.Item>
        </Descriptions>
      ),
    });
  };

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

      {matches ? (
        <Button onClick={showInDialog}>{t("View more")}</Button>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

export default ScheduleSummaryElement;
