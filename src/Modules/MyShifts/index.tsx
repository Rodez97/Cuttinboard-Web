/** @jsx jsx */
import { jsx } from "@emotion/react";
import { doc } from "firebase/firestore";
import { capitalize, groupBy, orderBy } from "lodash";
import React, { useMemo, useState } from "react";
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
import { EmployeeShifts } from "@cuttinboard-solutions/cuttinboard-library/schedule";
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

  const groupByDay = useMemo(() => {
    if (!shifts?.shiftsArray) {
      return [];
    }
    const orderedShifts = orderBy(
      shifts?.shiftsArray,
      (shf) => shf.getStartDayjsDate.toDate(),
      "asc"
    );

    const filterPublishedShifts = orderedShifts.filter(
      (shf) => shf.status === "published"
    );

    const grouped = groupBy(filterPublishedShifts, (shf) =>
      capitalize(shf.origData.start.format("dddd, MMMM DD, YYYY"))
    );
    return Object.entries(grouped);
  }, [shifts?.shiftsArray]);

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
                {groupByDay.length ? (
                  <Space
                    style={{ display: "flex", width: "100%" }}
                    direction="vertical"
                  >
                    {isInCurrentWeek ? (
                      groupByDay.map(([day, shifts], index) => {
                        const isToday = shifts[0].getStartDayjsDate.isSame(
                          dayjs(),
                          "day"
                        );
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
                      })
                    ) : (
                      <React.Fragment>
                        {/* 📅 Next Week */}
                        {shifts &&
                          groupByDay.map(([day, shifts], index) => {
                            return (
                              <div key={index}>
                                <Divider orientation="left">{day}</Divider>

                                {shifts.map((shift) => (
                                  <ShiftCard key={shift.id} shift={shift} />
                                ))}
                              </div>
                            );
                          })}
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
