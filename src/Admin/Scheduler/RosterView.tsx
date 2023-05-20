/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Divider, Layout, Table, TableColumnsType, Tag } from "antd/es";
import { Button, Space, Typography } from "antd/es";
import {
  FilePdfOutlined,
  LeftCircleOutlined,
  RightCircleOutlined,
} from "@ant-design/icons";
import "./RosterView.scss";
import groupBy from "lodash-es/groupBy";
import upperFirst from "lodash-es/upperFirst";
import { useNavigate } from "react-router-dom";
import { GrayPageHeader, LoadingPage } from "../../shared";
import {
  getShiftDayjsDate,
  getShiftDuration,
  getShiftLatestData,
  minutesToTextDuration,
  parseWeekId,
  useCuttinboardLocation,
  useLocationPermissions,
  useSchedule,
  useWageData,
} from "@cuttinboard-solutions/cuttinboard-library";
import isoWeek from "dayjs/plugin/isoWeek";
import usePageTitle from "../../hooks/usePageTitle";
import { generateRosterPdf } from "./NewPDF";
import ErrorPage from "../../shared/molecules/PageError";
import {
  getEmployeeFullName,
  IEmployee,
  IShift,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";
import { logAnalyticsEvent } from "utils/analyticsHelpers";
dayjs.extend(isoWeek);

export type RosterData = {
  employee: IEmployee;
  shift: IShift;
};

function RosterView() {
  usePageTitle("Scheduler - Roster View");
  const navigate = useNavigate();
  const { employeeShifts, weekDays, weekId, loading, error } = useSchedule();
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const { t } = useTranslation();
  const { location, employees: getEmployees } = useCuttinboardLocation();
  const wageData = useWageData();
  const checkPermission = useLocationPermissions();

  const employees = useMemo(() => {
    // Get all employees except the supervisor
    const emp = getEmployees.filter((e) => e.role !== RoleAccessLevels.ADMIN);
    // Return the array sorted by locationRole
    return emp.sort((a, b) => a.role - b.role);
  }, [getEmployees]);

  const columns = useMemo(
    (): TableColumnsType<RosterData> => [
      {
        title: t("Employee"),
        dataIndex: "employee",
        key: "employee",
        render: (_, { employee }) => getEmployeeFullName(employee),
        sorter: {
          compare: (a, b, order) => {
            const aFullName = getEmployeeFullName(a.employee);
            const bFullName = getEmployeeFullName(b.employee);
            if (order === "ascend") {
              return aFullName.localeCompare(bFullName);
            }
            if (order === "descend") {
              return bFullName.localeCompare(aFullName);
            }
            return a.employee.role - b.employee.role;
          },
        },
      },
      {
        title: t("Position"),
        dataIndex: "position",
        key: "position",
        render: (_, { shift }) => {
          return shift.position ? (
            <Tag color="processing">{shift.position}</Tag>
          ) : (
            <Tag color="error">{t("No position")}</Tag>
          );
        },
      },
      {
        title: t("Start"),
        dataIndex: "start",
        key: "start",
        render: (_, { shift }) =>
          getShiftDayjsDate(shift, "start").format("h:mm a"),
      },
      {
        title: t("End"),
        dataIndex: "end",
        key: "end",
        render: (_, { shift }) =>
          getShiftDayjsDate(shift, "end").format("h:mm a"),
      },
      {
        title: t("Time"),
        dataIndex: "time",
        key: "time",
        render: (_, { shift }) => {
          return minutesToTextDuration(getShiftDuration(shift).totalMinutes);
        },
      },
      {
        title: t("Overtime"),
        dataIndex: "overtime",
        key: "overtime",
        render: (_, { shift, employee }) => {
          const shiftWageData = wageData?.[employee.id].shifts.get(
            shift.id
          )?.wageData;
          const overtimeHours = shiftWageData ? shiftWageData.overtimeHours : 0;
          return minutesToTextDuration(overtimeHours * 60);
        },
      },
      ...(checkPermission("seeWages")
        ? [
            {
              title: t("Base pay"),
              dataIndex: "basePay",
              key: "basePay",
              render: (_, { shift, employee }) => {
                const shiftWageData = wageData?.[employee.id].shifts.get(
                  shift.id
                )?.wageData;
                const normalWage = shiftWageData ? shiftWageData.normalWage : 0;
                return `$${normalWage.toFixed(2)}`;
              },
            },
            {
              title: t("Overtime pay"),
              dataIndex: "overtimePay",
              key: "overtimePay",
              render: (_, { shift, employee }) => {
                const shiftWageData = wageData?.[employee.id].shifts.get(
                  shift.id
                )?.wageData;
                const overtimeWage = shiftWageData
                  ? shiftWageData.overtimeWage
                  : 0;
                return `$${overtimeWage.toFixed(2)}`;
              },
            },
            {
              title: t("Final wage"),
              dataIndex: "wage",
              key: "wage",
              render: (_, { shift, employee }) => {
                const shiftWageData = wageData?.[employee.id].shifts.get(
                  shift.id
                )?.wageData;
                const totalWage = shiftWageData ? shiftWageData.totalWage : 0;
                return `$${totalWage.toFixed(2)}`;
              },
            },
          ]
        : []),
    ],
    [checkPermission, t, wageData]
  );

  const dataSource = useMemo(() => {
    const shiftsCollection: RosterData[] = [];
    employeeShifts
      .map(({ employee, shifts }) => ({
        employeeId: employee.id,
        shiftsColl: shifts
          ? shifts
              .filter((shift) =>
                getShiftDayjsDate(shift, "start").isSame(
                  weekDays[selectedDateIndex],
                  "day"
                )
              )
              .map(getShiftLatestData)
          : [],
      }))
      .forEach((shiftsDoc) => {
        shiftsDoc.shiftsColl.forEach((shift) => {
          if (
            !shift.deleting // If the shift is not being deleted
          ) {
            // If the shift is not deleted and is published, add it to the collection
            const employee = employees.find(
              (e) => e.id === shiftsDoc.employeeId
            );
            if (employee) {
              shiftsCollection.push({
                shift,
                employee,
              });
            }
          }
        });
      });

    return groupBy(shiftsCollection, ({ shift }) =>
      getShiftDayjsDate(shift, "start").format("a")
    );
  }, [employees, employeeShifts, weekDays, selectedDateIndex]);

  const currentWeekText = useMemo(() => {
    const { start, end } = parseWeekId(weekId);

    const firstDayWeek = start.format("MMM DD");
    const lastDayWeek = end.format("MMM DD");
    return `${firstDayWeek} - ${lastDayWeek}`.toUpperCase();
  }, [weekId]);

  const generatePDF = async () => {
    const amRoster = dataSource["am"] ?? [];
    const pmRoster = dataSource["pm"] ?? [];
    await generateRosterPdf(
      amRoster,
      pmRoster,
      weekId,
      weekDays[selectedDateIndex],
      location.name
    );
    logAnalyticsEvent("schedule_roster_pdf_generated");
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPage error={error} />;
  }

  return (
    <Layout css={{ overflowX: "auto" }}>
      <GrayPageHeader
        onBack={() => navigate(-1)}
        title={t("Roster")}
        subTitle={currentWeekText}
        extra={
          <Button
            onClick={generatePDF}
            icon={<FilePdfOutlined />}
            type="dashed"
          >
            {t("Generate PDF")}
          </Button>
        }
      />
      <Layout.Content>
        <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
          <Space
            align="center"
            wrap
            css={{ justifyContent: "center", padding: "10px 5px" }}
          >
            <Button
              onClick={() =>
                setSelectedDateIndex((si) => (si === 0 ? 6 : si - 1))
              }
              shape="circle"
              icon={<LeftCircleOutlined />}
              type="text"
            />
            <Typography.Text type="secondary" css={{ fontSize: 18 }}>
              {upperFirst(
                weekDays[selectedDateIndex].format("dddd, MMMM DD, YYYY")
              )}
            </Typography.Text>
            <Button
              onClick={() =>
                setSelectedDateIndex((si) => (si === 6 ? 0 : si + 1))
              }
              shape="circle"
              icon={<RightCircleOutlined />}
              type="text"
            />
          </Space>

          <Divider>{t("AM Shifts")}</Divider>

          <Table
            className="rosterTable"
            scroll={{ x: 1000 }}
            size="small"
            bordered
            columns={columns}
            dataSource={dataSource["am"]}
            pagination={false}
            rowKey={(e) => e.shift.id}
            tableLayout="fixed"
          />

          <Divider>{t("PM Shifts")}</Divider>

          <Table
            className="rosterTable"
            size="small"
            bordered
            columns={columns}
            dataSource={dataSource["pm"]}
            pagination={false}
            rowKey={(e) => e.shift.id}
            tableLayout="fixed"
          />
        </div>
      </Layout.Content>
    </Layout>
  );
}

export default RosterView;
