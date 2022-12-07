/** @jsx jsx */
import {
  minutesToTextDuration,
  ScheduleDoc,
  WageDataByDay,
} from "@cuttinboard-solutions/cuttinboard-library/schedule";
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  FIRESTORE,
  WEEKFORMAT,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { jsx } from "@emotion/react";
import { Alert, Card, Divider, Skeleton, Space, Statistic } from "antd";
import dayjs from "dayjs";
import { doc } from "firebase/firestore";
import { useMemo } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useTranslation } from "react-i18next";

export default () => {
  const { t } = useTranslation();
  const { location } = useCuttinboardLocation();
  const [scheduleDocuments, scheduleDocumentLoading, error] = useDocumentData(
    doc(
      FIRESTORE,
      "Organizations",
      location.organizationId,
      "scheduleDocs",
      `${dayjs().format(WEEKFORMAT)}_${location.id}`
    ).withConverter(ScheduleDoc.firestoreConverter)
  );

  const getTodayData = useMemo((): WageDataByDay[number] & {
    percent: number;
    projectedSales: number;
  } => {
    const isoWeekDay = dayjs().isoWeekday();
    const defaultData = {
      normalHours: 0,
      overtimeHours: 0,
      totalHours: 0,
      normalWage: 0,
      overtimeWage: 0,
      totalWage: 0,
      totalShifts: 0,
      people: 0,
      percent: 0,
      projectedSales: 0,
    };
    if (
      scheduleDocuments &&
      scheduleDocuments.scheduleSummary?.byDay?.[isoWeekDay]
    ) {
      const data = scheduleDocuments.scheduleSummary.byDay[isoWeekDay];
      const projectedSales =
        scheduleDocuments?.projectedSalesByDay?.[isoWeekDay] ?? 0;
      const laborPercent = (data.totalWage / projectedSales) * 100;
      return {
        ...data,
        percent: isFinite(laborPercent) ? laborPercent : 0,
        projectedSales,
      };
    } else {
      return defaultData;
    }
  }, [scheduleDocuments]);

  return (
    <Space
      direction="vertical"
      css={{
        padding: 20,
        flex: 1,
        display: "flex",
      }}
    >
      <Divider orientation="left">{t("Schedule Summary")}</Divider>

      <Skeleton loading={scheduleDocumentLoading}>
        {getTodayData.projectedSales <= 0 && (
          <Alert
            message={t("No projected sales for today")}
            type="warning"
            showIcon
            css={{
              margin: "5px 10px",
            }}
          />
        )}

        <Space size="small" wrap css={{ padding: "5px 10px" }}>
          <Card>
            <Statistic
              title={t("Est. Wages (Total)")}
              value={getTodayData.totalWage}
              prefix="$"
              precision={2}
            />
          </Card>

          <Card>
            <Statistic
              title={t("OT Wages")}
              value={getTodayData.overtimeWage}
              valueStyle={{
                color: getTodayData.overtimeWage > 0 ? "#cf1322" : "#3f8600",
              }}
              prefix="$"
              precision={2}
            />
          </Card>

          <Card>
            <Statistic
              title={t("Scheduled hours")}
              value={minutesToTextDuration(getTodayData.totalHours * 60)}
            />
          </Card>

          <Card>
            <Statistic
              title={t("OT Hours")}
              value={minutesToTextDuration(getTodayData.overtimeHours * 60)}
              valueStyle={{
                color: getTodayData.overtimeHours > 0 ? "#cf1322" : "#3f8600",
              }}
            />
          </Card>

          <Card>
            <Statistic title={t("People")} value={getTodayData.people} />
          </Card>

          <Card>
            <Statistic title={t("Shifts")} value={getTodayData.totalShifts} />
          </Card>

          <Card>
            <Statistic
              title={t("Est. Labor %")}
              value={getTodayData.percent}
              suffix="%"
              precision={2}
            />
          </Card>

          <Card>
            <Statistic
              title={t("Projected Sales")}
              value={getTodayData.projectedSales}
              prefix="$"
              precision={2}
            />
          </Card>
        </Space>
      </Skeleton>

      {error && <Alert message={error.message} type="error" showIcon />}
    </Space>
  );
};
