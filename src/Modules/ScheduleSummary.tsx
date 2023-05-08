/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Alert, Card, Divider, Skeleton, Space, Statistic } from "antd";
import { useTranslation } from "react-i18next";
import { ScheduleTodaySummary } from "./useSummaryData";
import {
  minutesToTextDuration,
  useLocationPermissions,
} from "@cuttinboard-solutions/cuttinboard-library";
import React from "react";

export default function ScheduleSummary({
  scheduleTodaySummary,
  loading,
}: {
  scheduleTodaySummary: ScheduleTodaySummary;
  loading: boolean;
}) {
  const { t } = useTranslation();
  const checkPermission = useLocationPermissions();

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

      <Skeleton loading={loading}>
        {scheduleTodaySummary.projectedSales <= 0 && (
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
          {checkPermission("seeWages") && (
            <React.Fragment>
              <Card>
                <Statistic
                  title={t("Est. Wages (Total)")}
                  value={scheduleTodaySummary.totalWage}
                  prefix="$"
                  precision={2}
                />
              </Card>
              <Card>
                <Statistic
                  title={t("OT Wages")}
                  value={scheduleTodaySummary.overtimeWage}
                  valueStyle={{
                    color:
                      scheduleTodaySummary.overtimeWage > 0
                        ? "#cf1322"
                        : "#3f8600",
                  }}
                  prefix="$"
                  precision={2}
                />
              </Card>
              <Card>
                <Statistic
                  title={t("Est. Labor %")}
                  value={scheduleTodaySummary.percent}
                  suffix="%"
                  precision={2}
                />
              </Card>
            </React.Fragment>
          )}

          <Card>
            <Statistic
              title={t("Scheduled Hours")}
              value={minutesToTextDuration(
                scheduleTodaySummary.totalHours * 60
              )}
            />
          </Card>

          <Card>
            <Statistic
              title={t("OT Hours")}
              value={minutesToTextDuration(
                scheduleTodaySummary.overtimeHours * 60
              )}
              valueStyle={{
                color:
                  scheduleTodaySummary.overtimeHours > 0
                    ? "#cf1322"
                    : "#3f8600",
              }}
            />
          </Card>

          <Card>
            <Statistic
              title={t("People")}
              value={scheduleTodaySummary.people}
            />
          </Card>

          <Card>
            <Statistic
              title={t("Shifts")}
              value={scheduleTodaySummary.totalShifts}
            />
          </Card>

          <Card>
            <Statistic
              title={t("Projected Sales")}
              value={scheduleTodaySummary.projectedSales}
              prefix="$"
              precision={2}
            />
          </Card>
        </Space>
      </Skeleton>
    </Space>
  );
}
