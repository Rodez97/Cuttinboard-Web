/** @jsx jsx */
import { jsx } from "@emotion/react";
import ShiftCard from "./Card";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useTranslation } from "react-i18next";
import { Checkbox, Divider, Empty, Layout, Space, Spin, Tag } from "antd";
import {
  Colors,
  useMyShifts,
} from "@cuttinboard-solutions/cuttinboard-library";
import { GrayPageHeader, PageError } from "../../shared";
import usePageTitle from "../../hooks/usePageTitle";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { getShiftDayjsDate } from "@cuttinboard-solutions/types-helpers";
dayjs.extend(isoWeek);

export default function MyShifts({ locationId }: { locationId?: string }) {
  usePageTitle("My Shifts");
  const { t } = useTranslation();
  const { loading, error, groupedByDay, setOnlyLocation, onlyLocation } =
    useMyShifts(locationId);

  const onChange = (e: CheckboxChangeEvent) => {
    setOnlyLocation(e.target.checked);
  };

  return (
    <Layout.Content
      css={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <GrayPageHeader title={t("My Shifts")} />

      {locationId && groupedByDay.length > 0 && (
        <div
          css={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 10,
          }}
        >
          <Checkbox onChange={onChange} checked={onlyLocation}>
            {t("Only show shifts at this location")}
          </Checkbox>
        </div>
      )}

      {error ? (
        <PageError error={new Error(error)} />
      ) : (
        <Layout.Content
          css={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <Spin spinning={loading}>
            <div
              css={{ display: "flex", flexDirection: "column", padding: 20 }}
            >
              <div
                css={{
                  minWidth: 270,
                  maxWidth: 700,
                  margin: "auto",
                  width: "100%",
                }}
              >
                {groupedByDay.length ? (
                  <Space
                    style={{ display: "flex", width: "100%" }}
                    direction="vertical"
                  >
                    {groupedByDay.map(([day, shifts], index) => {
                      const isToday = getShiftDayjsDate(
                        shifts[0],
                        "start"
                      ).isSame(dayjs(), "day");
                      return (
                        <div
                          key={index}
                          css={{
                            border: isToday
                              ? "1px dotted #00000025"
                              : "initial",
                            padding: isToday ? 3 : "initial",
                          }}
                        >
                          <Divider orientation="left">
                            {day}
                            {isToday && (
                              <Tag
                                color={Colors.MainBlue}
                                css={{ marginLeft: 10 }}
                              >
                                {t("Today")}
                              </Tag>
                            )}
                          </Divider>

                          {shifts.map((shift) => (
                            <ShiftCard key={shift.id} shift={shift} />
                          ))}
                        </div>
                      );
                    })}
                  </Space>
                ) : (
                  <Empty description={t("There are no scheduled shifts")} />
                )}
              </div>
            </div>
          </Spin>
        </Layout.Content>
      )}
    </Layout.Content>
  );
}
