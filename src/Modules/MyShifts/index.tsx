/** @jsx jsx */
import { jsx } from "@emotion/react";
import ShiftCard from "./Card";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Checkbox,
  Divider,
  Empty,
  Layout,
  Space,
  Spin,
  Tag,
} from "antd";
import {
  Colors,
  MyShiftsProvider,
  useMyShifts,
} from "@cuttinboard-solutions/cuttinboard-library";
import { GrayPageHeader, PageError } from "../../shared";
import usePageTitle from "../../hooks/usePageTitle";
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { WEEKFORMAT } from "@cuttinboard-solutions/types-helpers";
import MyAvailability from "./MyAvailability";
import React, { ReactNode, useMemo, useState } from "react";
import advancedFormat from "dayjs/plugin/advancedFormat";
import WeekNavigator from "../../Admin/Scheduler/WeekNavigator";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);

export default function MyShifts({ locationId }: { locationId?: string }) {
  usePageTitle("My Shifts");
  const { t } = useTranslation();
  const [weekId, setWeekId] = useState(dayjs().format(WEEKFORMAT));

  return (
    <MyShiftsProvider locationId={locationId} weekId={weekId}>
      <Layout.Content
        css={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        <GrayPageHeader
          title={t("My Shifts")}
          extra={locationId && <MyAvailability />}
        />
        {!locationId && (
          <Alert
            type="info"
            message={t("AVAILABILITY_IN_LOCATION_ALERT")}
            banner
          />
        )}

        <MyShiftsContent
          locationId={locationId}
          weekSelectorElement={
            <div
              css={{
                minWidth: 270,
                maxWidth: 700,
                margin: "auto",
                width: "100%",
                padding: 20,
                flexDirection: "row",
                marginTop: 10,
              }}
            >
              <WeekNavigator onChange={setWeekId} currentWeekId={weekId} />
              {dayjs().format(WEEKFORMAT) === weekId && (
                <Tag
                  key="thisWeek"
                  color="processing"
                  css={{
                    marginLeft: 10,
                  }}
                >
                  {t("This week")}
                </Tag>
              )}
            </div>
          }
        />
      </Layout.Content>
    </MyShiftsProvider>
  );
}

export function MyShiftsContent({
  locationId,
  weekSelectorElement,
}: {
  locationId?: string;
  weekSelectorElement: ReactNode;
}) {
  usePageTitle("My Shifts");
  const { t } = useTranslation();
  const { loading, error, groupedByDay, setOnlyLocation, onlyLocation } =
    useMyShifts();

  const onChange = (e: CheckboxChangeEvent) => {
    setOnlyLocation(e.target.checked);
  };

  const sorted = useMemo(() => {
    return groupedByDay.sort(([a], [b]) => {
      return dayjs(a).isAfter(dayjs(b)) ? 1 : -1;
    });
  }, [groupedByDay]);

  return (
    <React.Fragment>
      {locationId && (
        <div
          css={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 10,
            marginTop: 20,
          }}
        >
          <Checkbox onChange={onChange} checked={onlyLocation}>
            {t("Only show shifts at this location")}
          </Checkbox>
        </div>
      )}

      {weekSelectorElement}

      {error ? (
        <PageError error={error} />
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
                    {sorted.map(([day, shifts], index) => {
                      const date = dayjs(day);
                      const dateText = date.format("dddd, MMMM DD, YYYY");
                      const isToday = date.isSame(dayjs(), "day");
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
                            {dateText}
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
    </React.Fragment>
  );
}
