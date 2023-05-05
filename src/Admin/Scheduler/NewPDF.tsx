import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  pdf,
  Image,
} from "@react-pdf/renderer";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library";
import { Dictionary, groupBy, upperFirst } from "lodash";
import dayjs from "dayjs";
import i18n from "../../i18n";
import AllWhiteLogo from "../../assets/images/Color-on-light-backgrounds.png";
import fileDownload from "js-file-download";
import { RosterData } from "./RosterView";
import {
  getEmployeeFullName,
  getEmployeeShiftsSummary,
  getShiftDayjsDate,
  getShiftIsoWeekday,
  IEmployee,
  IShift,
  minutesToTextDuration,
  parseWeekId,
  ShiftWage,
  WageDataByDay,
} from "@cuttinboard-solutions/types-helpers";

const styles = StyleSheet.create({
  body: {
    padding: 5,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  headerRow: {
    backgroundColor: Colors.Blue.Light,
  },
  tableCol: {
    width: "12.5%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableRosterCol: {
    width: "33.33%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  empCol: {
    backgroundColor: Colors.Blue.Light,
  },
  headerCell: {
    margin: 3,
    textAlign: "center",
    fontSize: 12,
  },
  employeeTitle: {
    margin: 2,
    fontSize: 10,
    fontWeight: "bold",
    textOverflow: "ellipsis",
  },
  employeeSubtitle: {
    margin: 2,
    fontSize: 8,
  },
});

const SchedulePDF = (
  empDocs: {
    key: string;
    employee: IEmployee;
    shifts: IShift[];
  }[],
  locationName: string,
  weekId: string,
  weekDays: dayjs.Dayjs[],
  wageData: Dictionary<{
    summary: WageDataByDay;
    shifts: Map<
      string,
      {
        wageData: ShiftWage;
        isoWeekDay: number;
      }
    >;
  }>
) => {
  // Get Week number and text
  const { start, end, week } = parseWeekId(weekId);

  const firstDayWeek = start.format("MMMM D");
  const lastDayWeek = end.format("MMMM D");

  // Filter empDocs to get only the docs with shifts
  const empDocsFiltered = empDocs.filter(
    (eds) => eds.shifts && eds.shifts.length > 0
  );

  if (empDocsFiltered.length === 0) {
    alert("No shifts to generate schedule");
  }

  return (
    <Document>
      <Page orientation="landscape" size="A4" style={styles.body}>
        <View
          style={{
            marginBottom: 8,
          }}
        >
          <View
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src={AllWhiteLogo}
              style={{
                width: 100,
                marginBottom: 3,
              }}
            />
            <Text
              style={{
                fontSize: 10,
              }}
            >
              www.cuttinboard.com
            </Text>
          </View>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontSize: 13,
              }}
            >
              {locationName}
            </Text>

            <Text
              style={{
                fontSize: 13,
              }}
            >
              {`Week #${week}, ${upperFirst(firstDayWeek)} - ${upperFirst(
                lastDayWeek
              )}`}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.headerRow]}>
            <View style={styles.tableCol}>
              <Text style={styles.headerCell}>
                {i18n.t("Employees").toUpperCase()}
              </Text>
            </View>
            {weekDays.map((day) => (
              <View style={styles.tableCol} key={day.toISOString()}>
                <Text style={styles.headerCell}>
                  {day.format("ddd").toUpperCase()}
                </Text>
              </View>
            ))}
          </View>

          {empDocsFiltered.map(({ employee, shifts }, index) => {
            const weekData = wageData?.[employee.id].summary;
            if (!weekData || !shifts || shifts.length === 0) {
              return null;
            }

            const weekSummary = getEmployeeShiftsSummary(weekData);
            return (
              <View style={styles.tableRow} key={index}>
                <View style={[styles.tableCol, styles.empCol]}>
                  <Text style={styles.employeeTitle}>
                    {getEmployeeFullName(employee)}
                  </Text>
                  <Text style={styles.employeeSubtitle}>
                    {minutesToTextDuration(weekSummary.totalHours * 60)}
                  </Text>
                </View>
                {weekDays.map((day) => {
                  const shiftsData = shifts.filter(
                    (shift) => getShiftIsoWeekday(shift) === day.isoWeekday()
                  );
                  return (
                    <View key={Math.random()} style={styles.tableCol}>
                      {shiftsData.map((shift) => {
                        const startTime = getShiftDayjsDate(
                          shift,
                          "start"
                        ).format("h:mma");
                        const endTime = getShiftDayjsDate(shift, "end").format(
                          "h:mma"
                        );
                        const fullTime = `${startTime} - ${endTime}`;
                        return (
                          <View
                            key={shift.id}
                            style={{
                              margin: 2,
                              border: "1px solid " + Colors.MainDark,
                            }}
                          >
                            {shift.position && (
                              <Text
                                style={{
                                  backgroundColor: Colors.MainDark,
                                  color: "white",
                                  fontWeight: "bold",
                                  fontSize: 10,
                                  textAlign: "center",
                                  textOverflow: "ellipsis",
                                  padding: 2,
                                }}
                              >
                                {shift.position}
                              </Text>
                            )}

                            <Text
                              style={{
                                fontSize: 10,
                                textAlign: "center",
                                padding: 2,
                              }}
                            >
                              {fullTime}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
};

function Header(props: {
  locationName: string;
  week: number;
  firstDayWeek: string;
  lastDayWeek: string;
}) {
  return (
    <View
      style={{
        marginBottom: 8,
      }}
    >
      <View
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          src={AllWhiteLogo}
          style={{
            width: 100,
            marginBottom: 3,
          }}
        />
        <Text
          style={{
            fontSize: 10,
          }}
        >
          www.cuttinboard.com
        </Text>
      </View>

      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            fontSize: 13,
          }}
        >
          {props.locationName}
        </Text>

        <Text
          style={{
            fontSize: 13,
          }}
        >
          {`Week #${props.week}, ${upperFirst(
            props.firstDayWeek
          )} - ${upperFirst(props.lastDayWeek)}`}
        </Text>
      </View>
    </View>
  );
}

function RosterPosition({ children }: { children: string }) {
  return (
    <View
      style={{
        backgroundColor: Colors.Yellow.Light,
        borderStyle: "solid",
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
      }}
    >
      <Text
        style={[
          styles.headerCell,
          {
            fontSize: 10,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

function RosterRow({
  name,
  start,
  end,
}: {
  name: string;
  start: string;
  end: string;
}) {
  return (
    <View style={styles.tableRow}>
      <View style={styles.tableRosterCol}>
        <Text style={styles.headerCell}>{name}</Text>
      </View>

      <View style={styles.tableRosterCol}>
        <Text style={styles.headerCell}>{start}</Text>
      </View>

      <View style={styles.tableRosterCol}>
        <Text style={styles.headerCell}>{end}</Text>
      </View>
    </View>
  );
}

const RosterPDF = (
  amRoster: RosterData[] | null,
  pmRoster: RosterData[] | null,
  weekId: string,
  day: dayjs.Dayjs,
  locationName: string
) => {
  // Get Week number and text
  const { start, end, week } = parseWeekId(weekId);

  const firstDayWeek = start.format("MMM DD");
  const lastDayWeek = end.format("MMM DD");
  const dayText = upperFirst(day.format("dddd, MMMM DD, YYYY"));

  // Group am roster by shift position
  const amRosterGrouped = groupBy(amRoster, ({ shift }) =>
    shift.position ? shift.position : "NO POSITION"
  );
  // Group pm roster by shift position
  const pmRosterGrouped = groupBy(pmRoster, ({ shift }) =>
    shift.position ? shift.position : "NO POSITION"
  );

  return (
    <Document>
      <Page size="A4" style={styles.body}>
        <Header
          week={week}
          firstDayWeek={firstDayWeek}
          lastDayWeek={lastDayWeek}
          locationName={locationName}
        />

        <Text style={styles.headerCell}>{dayText}</Text>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.headerRow]}>
            <View style={styles.tableRosterCol}>
              <Text style={styles.headerCell}>Name</Text>
            </View>
            <View style={styles.tableRosterCol}>
              <Text style={styles.headerCell}>Start Time</Text>
            </View>
            <View style={styles.tableRosterCol}>
              <Text style={styles.headerCell}>End Time</Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: Colors.Green.Light,
              borderStyle: "solid",
              borderWidth: 1,
              borderLeftWidth: 0,
              borderTopWidth: 0,
            }}
          >
            <Text style={styles.headerCell}>AM Roster</Text>
          </View>

          {Object.entries(amRosterGrouped).map(([position, shifts]) => {
            return (
              <View key={position}>
                <RosterPosition>{position}</RosterPosition>

                {shifts.map(({ employee, shift }) => {
                  return (
                    <RosterRow
                      key={shift.id}
                      name={getEmployeeFullName(employee)}
                      start={getShiftDayjsDate(shift, "start").format("h:mm a")}
                      end={getShiftDayjsDate(shift, "end").format("h:mm a")}
                    />
                  );
                })}
              </View>
            );
          })}

          <View
            style={{
              backgroundColor: Colors.Green.Light,
              borderStyle: "solid",
              borderWidth: 1,
              borderLeftWidth: 0,
              borderTopWidth: 0,
            }}
          >
            <Text style={styles.headerCell}>PM Roster</Text>
          </View>

          {Object.entries(pmRosterGrouped).map(([position, shifts]) => {
            return (
              <View key={position}>
                <RosterPosition>{position}</RosterPosition>

                {shifts.map(({ employee, shift }) => {
                  return (
                    <RosterRow
                      key={shift.id}
                      name={getEmployeeFullName(employee)}
                      start={getShiftDayjsDate(shift, "start").format("h:mm a")}
                      end={getShiftDayjsDate(shift, "end").format("h:mm a")}
                    />
                  );
                })}
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
};

export const generateSchedulePdf = async (
  empDocs: {
    key: string;
    employee: IEmployee;
    shifts: IShift[];
  }[],
  locationName: string,
  weekId: string,
  weekDays: dayjs.Dayjs[],
  wageData: Dictionary<{
    summary: WageDataByDay;
    shifts: Map<
      string,
      {
        wageData: ShiftWage;
        isoWeekDay: number;
      }
    >;
  }>
) => {
  const blob = await pdf(
    SchedulePDF(empDocs, locationName, weekId, weekDays, wageData)
  ).toBlob();

  fileDownload(blob, "Schedule " + weekId + ".pdf", "application/pdf");
};

export const generateRosterPdf = async (
  amRoster: RosterData[] | null,
  pmRoster: RosterData[] | null,
  weekId: string,
  day: dayjs.Dayjs,
  locationName: string
) => {
  const blob = await pdf(
    RosterPDF(amRoster, pmRoster, weekId, day, locationName)
  ).toBlob();

  fileDownload(blob, "Roster " + weekId + ".pdf", "application/pdf");
};
