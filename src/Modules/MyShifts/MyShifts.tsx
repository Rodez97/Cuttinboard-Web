/** @jsx jsx */
import { jsx } from "@emotion/react";
import { collection, doc, query, where } from "firebase/firestore";
import { orderBy } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  useCollectionData,
  useDocumentData,
} from "react-firebase-hooks/firestore";
import { useNavigate } from "react-router-dom";
import {
  TitleBoxBlue,
  TitleBoxGreen,
  TitleBoxYellow,
} from "../../theme/styledComponents";
import ShiftCard from "./ShiftCard";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useTranslation } from "react-i18next";
import {
  Auth,
  Firestore,
} from "@cuttinboard-solutions/cuttinboard-library/firebase";
import {
  getShiftDate,
  useLocation,
  useNotificationsBadges,
  WEEKFORMAT,
  weekToDate,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  ScheduleDoc,
  ScheduleDocConverter,
  Shift,
  ShiftConverter,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { Empty, Layout, Space, Spin, Tabs } from "antd";
import { GrayPageHeader } from "components/PageHeaders";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

function MyShifts() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { locationDocRef } = useLocation();
  const [currentWeekId, setCurrentWeekId] = useState(
    dayjs().format(WEEKFORMAT)
  );
  const { removeBadge } = useNotificationsBadges();
  const isInCurrentWeek = useMemo(
    () => currentWeekId === dayjs().format(WEEKFORMAT),
    [currentWeekId]
  );
  const [scheduleDoc, loadingScheduleDoc, errorScheduleDoc] =
    useDocumentData<ScheduleDoc>(
      doc(
        Firestore,
        locationDocRef.path,
        "scheduleDocs",
        currentWeekId
      ).withConverter(ScheduleDocConverter)
    );

  const [shifts, loadingShifts, errorShifts] = useCollectionData<Shift>(
    scheduleDoc?.isPublished &&
      query(
        collection(Firestore, locationDocRef.path, "shifts"),
        where("altId", "in", [currentWeekId, "repeat"]),
        where("employeeId", "==", Auth.currentUser.uid)
      ).withConverter(ShiftConverter)
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
      const orderedShifts = orderBy(shifts, (shf) => shf.start, "asc");
      return weekDays.reduce<{ day: Date; shifts: Shift[] }[]>((acc, day) => {
        const dayShifts = orderedShifts.filter(
          (shf) => getShiftDate(shf.start).day() === day.getDay()
        );
        if (dayShifts?.length) {
          return [...acc, { day, shifts: dayShifts }];
        }
        return acc;
      }, []);
    },
    [weekDays, currentWeekId]
  );

  const getToday = useMemo(
    () =>
      shifts?.filter(
        (shift) =>
          getShiftDate(shift.start).isoWeekday() === dayjs().isoWeekday()
      ),
    [shifts]
  );

  const getThisWeek = useMemo(
    () =>
      shifts?.filter(
        (shift) => getShiftDate(shift.start).isoWeekday() > dayjs().isoWeekday()
      ),
    [shifts]
  );

  useEffect(() => {
    return () => {
      if (currentWeekId) removeBadge("sch", currentWeekId);
    };
  }, [currentWeekId]);

  return (
    <Layout>
      <Spin
        spinning={
          loadingScheduleDoc ||
          loadingShifts ||
          loadingScheduleDoc === undefined ||
          loadingShifts === undefined
        }
      >
        <GrayPageHeader onBack={() => navigate(-1)} title={t("My Shifts")} />
        <Layout.Content>
          <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
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
                  { label: t("This week"), key: dayjs().format(WEEKFORMAT) },
                  {
                    label: t("Next week"),
                    key: dayjs().add(7, "days").format(WEEKFORMAT),
                  },
                ]}
              />
              {scheduleDoc && shifts?.length ? (
                <Space
                  style={{ display: "flex", width: "100%" }}
                  direction="vertical"
                >
                  {isInCurrentWeek ? (
                    <React.Fragment>
                      {/* 📅 Today */}
                      {getToday?.length > 0 && (
                        <TitleBoxYellow>{t("Today")}</TitleBoxYellow>
                      )}
                      {getToday?.map((shift) => (
                        <ShiftCard key={shift.id} shift={shift} />
                      ))}

                      {/* 📅 This Week */}
                      {getThisWeek?.length > 0 && (
                        <TitleBoxGreen>{t("This week")}</TitleBoxGreen>
                      )}
                      {getThisWeek &&
                        groupByDay(getThisWeek).map(
                          ({ day, shifts }, index) => (
                            <div key={index}>
                              <TitleBoxBlue>
                                {dayjs(day).format("dddd, MMMM DD YYYY")}
                              </TitleBoxBlue>

                              {shifts.map((shift) => (
                                <ShiftCard key={shift.id} shift={shift} />
                              ))}
                            </div>
                          )
                        )}
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      {/* 📅 Next Week */}
                      {shifts && (
                        <React.Fragment>
                          <TitleBoxGreen>{t("Next week")}</TitleBoxGreen>
                          {groupByDay(shifts).map(({ day, shifts }, index) => (
                            <div key={index}>
                              <TitleBoxBlue>
                                {dayjs(day).format("dddd, MMMM DD YYYY")}
                              </TitleBoxBlue>

                              {shifts.map((shift) => (
                                <ShiftCard key={shift.id} shift={shift} />
                              ))}
                            </div>
                          ))}
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  )}
                </Space>
              ) : (
                <Empty description={t("There are no scheduled shifts")} />
              )}
            </div>
          </div>
        </Layout.Content>
      </Spin>
    </Layout>
  );
}

export default MyShifts;
