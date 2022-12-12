/** @jsx jsx */
import { jsx } from "@emotion/react";
import { doc } from "firebase/firestore";
import { capitalize, orderBy } from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import ShiftCard from "./Card";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useTranslation } from "react-i18next";
import { Divider, Empty, Layout, Space, Spin, Tabs, Tag } from "antd";
import {
  Colors,
  FIRESTORE,
  WEEKFORMAT,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { useLayoutEffect } from "react";
import { GrayPageHeader, PageError } from "../../shared";
import {
  useCuttinboard,
  useCuttinboardLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  EmployeeShifts,
  Shift,
  weekToDate,
} from "@cuttinboard-solutions/cuttinboard-library/schedule";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

export default () => {
  const { t } = useTranslation();
  const { location } = useCuttinboardLocation();
  const [currentWeekId, setCurrentWeekId] = useState(
    dayjs().format(WEEKFORMAT)
  );
  const { notifications, user } = useCuttinboard();
  const isInCurrentWeek = useMemo(
    () => currentWeekId === dayjs().format(WEEKFORMAT),
    [currentWeekId]
  );
  const [shifts, loadingShifts, errorShifts] = useDocumentData(
    doc(
      FIRESTORE,
      "Organizations",
      location.organizationId,
      "shifts",
      `${currentWeekId}_${user.uid}_${location.id}`
    ).withConverter(EmployeeShifts.Converter)
  );

  const weekDays = useMemo(() => {
    const year = Number.parseInt(currentWeekId.split("-")[2]);
    const weekNo = Number.parseInt(currentWeekId.split("-")[1]);
    const firstDayWeek = weekToDate(year, weekNo, 1);
    const weekDays: Date[] = [];
    weekDays.push(firstDayWeek);
    for (let index = 1; index < 7; index++) {
      weekDays.push(dayjs(firstDayWeek).add(index, "days").toDate());
    }
    return weekDays;
  }, [currentWeekId]);

  const groupByDay = useCallback(
    (shifts: Shift[]) => {
      const orderedShifts = orderBy(
        shifts,
        (shf) => shf.getStartDayjsDate,
        "asc"
      );
      return weekDays.reduce<{ day: Date; shifts: Shift[] }[]>((acc, day) => {
        const dayShifts = orderedShifts.filter(
          (shf) => shf.shiftIsoWeekday === dayjs(day).isoWeekday()
        );
        if (dayShifts?.length) {
          return [...acc, { day, shifts: dayShifts }];
        }
        return acc;
      }, []);
    },
    [weekDays]
  );

  useLayoutEffect(() => {
    return () => {
      notifications?.removeScheduleBadges(location.organizationId, location.id);
    };
  }, [location.id, location.organizationId, notifications]);

  return (
    <Layout.Content
      css={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <GrayPageHeader title={t("My Shifts")} />

      <div
        css={{
          minWidth: 270,
          maxWidth: 700,
          margin: "auto",
          width: "100%",
        }}
      >
        <Tabs
          centered
          onChange={setCurrentWeekId}
          defaultActiveKey={currentWeekId}
          items={[
            {
              label: t("This week"),
              key: dayjs().format(WEEKFORMAT),
              disabled: Boolean(loadingShifts || errorShifts),
            },
            {
              label: t("Next week"),
              key: dayjs().add(7, "days").format(WEEKFORMAT),
              disabled: Boolean(loadingShifts || errorShifts),
            },
          ]}
        />
      </div>

      {errorShifts ? (
        <PageError error={errorShifts} />
      ) : (
        <Layout.Content
          css={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <Spin spinning={loadingShifts || loadingShifts === undefined}>
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
                {shifts?.shiftsArray.length ? (
                  <Space
                    style={{ display: "flex", width: "100%" }}
                    direction="vertical"
                  >
                    {isInCurrentWeek ? (
                      groupByDay(shifts?.shiftsArray).map(
                        ({ day, shifts }, index) => (
                          <div
                            key={index}
                            css={{
                              border:
                                day.getDate() === new Date().getDate()
                                  ? "1px dotted #00000025"
                                  : "initial",
                              padding:
                                day.getDate() === new Date().getDate()
                                  ? 3
                                  : "initial",
                            }}
                          >
                            <Divider orientation="left">
                              {capitalize(
                                dayjs(day).format("dddd, MMMM DD, YYYY")
                              )}
                              {day.getDate() === new Date().getDate() && (
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
                        )
                      )
                    ) : (
                      <React.Fragment>
                        {/* 📅 Next Week */}
                        {shifts &&
                          groupByDay(shifts?.shiftsArray).map(
                            ({ day, shifts }, index) => (
                              <div key={index}>
                                <Divider orientation="left">
                                  {capitalize(
                                    dayjs(day).format("dddd, MMMM DD, YYYY")
                                  )}
                                </Divider>

                                {shifts.map((shift) => (
                                  <ShiftCard key={shift.id} shift={shift} />
                                ))}
                              </div>
                            )
                          )}
                      </React.Fragment>
                    )}
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
};