import { TDocumentDefinitions } from "pdfmake/interfaces";
import { RosterData } from "./RosterView";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import dayjs from "dayjs";
import { capitalize, groupBy } from "lodash";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { LogoDataUrl } from "./LogoDataUrl";
import { ShiftsTable } from "./Scheduler";
import {
  minutesToTextDuration,
  weekToDate,
} from "@cuttinboard-solutions/cuttinboard-library/schedule";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

// Const generate a pdf with tables for am and pm roster shifts for a given date and location
export const generateRosterPdf = (
  amRoster: RosterData[] | null,
  pmRoster: RosterData[] | null,
  weekId: string,
  day: Date,
  locationName: string
) => {
  // Get Week number and text
  const year = Number.parseInt(weekId.split("-")[2]);
  const weekNo = Number.parseInt(weekId.split("-")[1]);
  const firstDayWeek = dayjs(weekToDate(year, weekNo, 1));
  const lastDayWeek = firstDayWeek.add(6, "days");
  const weekText = `${firstDayWeek.format("MMM DD")} -> ${lastDayWeek.format(
    "MMM DD"
  )}`;
  const dayText = dayjs(day).format("dddd, MMMM DD, YYYY");

  // Group am roster by shift position
  const amRosterGrouped = groupBy(amRoster, ({ shift }) =>
    shift.position ? shift.position : "NO POSITION"
  );
  // Group pm roster by shift position
  const pmRosterGrouped = groupBy(pmRoster, ({ shift }) =>
    shift.position ? shift.position : "NO POSITION"
  );

  const docDefinition: TDocumentDefinitions = {
    content: [
      {
        stack: [
          {
            image: LogoDataUrl,
            width: 20,
            opacity: 0.7,
            margin: [0, 0, 0, 10],
          },
          {
            text: locationName,
            style: "locationName",
          },
        ],
        alignment: "center",
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          {
            text: dayText,
            style: "week",
            alignment: "left",
            bold: true,
            decoration: "underline",
          },
          {
            text: `Week ${weekNo}, ${weekText}`,
            style: "week",
            alignment: "right",
          },
        ],
      },
      {
        // Create a table with the shift position as separator of the shifts with a light orange background
        table: {
          headerRows: 3 + Object.keys(amRosterGrouped).length,
          widths: ["*", "*", "*"],
          body: [
            [
              { text: "Name", style: "tableHeader" },
              { text: "Start Time", style: "tableHeader" },
              { text: "End Time", style: "tableHeader" },
            ],

            [
              {
                text: "AM Roster",
                style: "tableTimeHeader",
                colSpan: 3,
              },
            ],
            ...Object.entries(amRosterGrouped).reduce(
              (acc, [position, shifts]) => {
                const sectionHeader = [
                  {
                    text: position,
                    style: "tablePositionHeader",
                    colSpan: 3,
                  },
                ];
                const sectionBody = shifts.map(({ employee, shift }) => [
                  employee.fullName,
                  shift.getStartDayjsDate.format("h:mm a"),
                  shift.getEndDayjsDate.format("h:mm a"),
                ]);
                console.log([sectionHeader, ...sectionBody]);
                return [...acc, sectionHeader, ...sectionBody];
              },
              []
            ),

            [
              {
                text: "PM Roster",
                style: "tableTimeHeader",
                colSpan: 3,
              },
            ],
            ...Object.entries(pmRosterGrouped).reduce(
              (acc, [position, shifts]) => {
                const sectionHeader = [
                  {
                    text: position,
                    style: "tablePositionHeader",
                    colSpan: 3,
                  },
                ];
                const sectionBody = shifts.map(({ employee, shift }) => [
                  employee.fullName,
                  shift.getStartDayjsDate.format("h:mm a"),
                  shift.getEndDayjsDate.format("h:mm a"),
                ]);
                console.log([sectionHeader, ...sectionBody]);
                return [...acc, sectionHeader, ...sectionBody];
              },
              []
            ),
          ],
        },
      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        alignment: "right",
        margin: [0, 0, 0, 20],
      },
      subheader: {
        fontSize: 14,
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: "black",
      },
      tablePositionHeader: {
        bold: true,
        fontSize: 10,
        color: "black",
        fillColor: "#F5E6C9",
        alignment: "center",
      },
      tableTimeHeader: {
        bold: true,
        fontSize: 12,
        color: "black",
        fillColor: Colors.Green.Light,
        alignment: "center",
      },
      locationName: {
        fontSize: 15,
        color: "black",
        alignment: "center",
        bold: true,
      },
      week: {
        fontSize: 12,
        color: "black",
        margin: [0, 0, 0, 20],
      },
    },
  };

  pdfMake.createPdf(docDefinition).download();
};

// Generate schedule pdf
export const generateSchedulePdf = (
  empDocs: ShiftsTable[],
  locationName: string,
  weekId: string,
  weekDays: Date[]
) => {
  // Get Week number and text
  const year = Number.parseInt(weekId.split("-")[2]);
  const weekNo = Number.parseInt(weekId.split("-")[1]);
  const firstDayWeek = dayjs(weekToDate(year, weekNo, 1));
  const lastDayWeek = firstDayWeek.add(6, "days");
  const weekText = `${capitalize(
    firstDayWeek.format("MMM[.] DD")
  )}  ->  ${capitalize(lastDayWeek.format("MMM[.] DD"))}`;

  // Filter empDocs to get only the docs with shifts
  const empDocsFiltered = empDocs.filter(
    (doc) => doc.empShifts && doc.empShifts.shiftsArray.length > 0
  );

  if (empDocsFiltered.length === 0) {
    alert("No shifts to generate schedule");
    return;
  }

  const docDefinition: TDocumentDefinitions = {
    pageOrientation: "landscape",
    watermark: {
      text: "CUTTINBOARD",
      color: "gray",
      opacity: 0.1,
      bold: true,
      italics: false,
    },
    header: {
      stack: [
        {
          image: LogoDataUrl,
          width: 100,
          margin: [0, 0, 0, 3],
        },
        {
          text: "www.cuttinboard.com",
          link: "https://www.cuttinboard.com",
          fontSize: 10,
        },
        {
          text: locationName,
          style: "locationName",
        },
      ],
      alignment: "center",
      margin: [0, 5, 0, 10],
    },
    content: [
      {
        columns: [
          {
            width: "*",
            text: locationName,
            style: "week",
            alignment: "left",
          },
          {
            width: "*",
            text: `Week ${weekNo}, ${weekText}`,
            style: "week",
            alignment: "right",
          },
        ],
      },
      {
        // Create a table with the shift position as separator of the shifts with a light orange background
        table: {
          headerRows: 2,
          widths: ["*", "*", "*", "*", "*", "*", "*", "*"],
          body: [
            [
              { text: "Employee", style: "tableHeader" },
              ...weekDays.map((day) => ({
                text: capitalize(dayjs(day).format("ddd")),
                style: "tableHeader",
                alignment: "center",
              })),
            ],
            ...empDocsFiltered.map(({ employee, empShifts }) => [
              {
                stack: [
                  {
                    text: employee.fullName,
                    bold: true,
                    fontSize: 10,
                    noWrap: true,
                  },
                  {
                    text: minutesToTextDuration(
                      empShifts!.summary.totalHours * 60
                    ),
                    fontSize: 8,
                  },
                ],
                fillColor: Colors.Blue.Light,
              },
              ...weekDays.map((day) => {
                const shifts = empShifts!.shiftsArray.filter(
                  (shift) => shift.shiftIsoWeekday === dayjs(day).isoWeekday()
                );
                if (shifts.length > 0) {
                  return shifts.reduce((acc, shift) => {
                    const startTime = shift.getStartDayjsDate
                      .format("h:mma")
                      .replace("am", "a");
                    const endTime = shift.getEndDayjsDate
                      .format("h:mma")
                      .replace("pm", "p");
                    const fullTime = `${startTime} - ${endTime}`;
                    let newShiftCell: any;
                    if (shift.position) {
                      newShiftCell = {
                        style: "shiftInnerTable",
                        table: {
                          headerRows: 1,
                          widths: ["*"],
                          body: [
                            [
                              {
                                text: shift.position,
                                style: "tablePositionHeader",
                              },
                            ],
                            [
                              {
                                text: fullTime,
                                style: "shiftTime",
                              },
                            ],
                          ],
                        },
                      };
                    } else {
                      newShiftCell = {
                        style: "shiftInnerTable",
                        table: {
                          widths: ["*"],
                          body: [
                            [
                              {
                                text: fullTime,
                                style: "shiftTime",
                              },
                            ],
                          ],
                        },
                      };
                    }
                    return [...acc, newShiftCell];
                  }, []);
                } else {
                  return "";
                }
              }),
            ]),
          ],
        },
      },
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        alignment: "right",
        margin: [0, 0, 0, 20],
      },
      subheader: {
        fontSize: 14,
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: "black",
        fillColor: Colors.Blue.Light,
      },
      tablePositionHeader: {
        bold: true,
        fontSize: 10,
        color: "white",
        alignment: "center",
        fillColor: Colors.MainDark,
      },
      tableTimeHeader: {
        bold: true,
        fontSize: 12,
        color: "black",
        fillColor: Colors.Green.Light,
        alignment: "center",
      },
      locationName: {
        fontSize: 15,
        color: "black",
        alignment: "center",
        bold: true,
      },
      week: {
        fontSize: 12,
        color: "black",
        margin: [0, 0, 0, 20],
      },
      shiftTime: {
        alignment: "center",
        fontSize: 10,
      },
      shiftInnerTable: {
        margin: [0, 0, 0, 1],
      },
    },
  };

  pdfMake.createPdf(docDefinition).download();
};
