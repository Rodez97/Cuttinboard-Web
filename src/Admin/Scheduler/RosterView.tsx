/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import {
  useEmployeesList,
  useLocation,
  useSchedule,
  weekToDate,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  Employee,
  Shift,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { Divider, Layout, Table, TableColumnsType } from "antd";
import { Button, Space, Typography } from "antd";
import {
  FilePdfOutlined,
  LeftCircleOutlined,
  RightCircleOutlined,
} from "@ant-design/icons";
import "./RosterView.scss";
import { groupBy } from "lodash";
import { getDurationText } from "./getDurationText";
import { RoleAccessLevels } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { useNavigate } from "react-router-dom";
import { generateRosterPdf } from "./generatePdf";
import { GrayPageHeader } from "../../components";

export type RosterData = {
  employee: Employee;
  shift: Shift;
};

function RosterView() {
  const navigate = useNavigate();
  const {
    employeeShiftsCollection,
    weekDays,
    selectedTag,
    searchQuery,
    weekId,
  } = useSchedule();
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const { t } = useTranslation();
  const { getEmployees } = useEmployeesList();
  const { location } = useLocation();

  const employees = useMemo(() => {
    // Get all employees except the supervisor
    const emp = getEmployees.filter(
      (e) => e.locationRole !== RoleAccessLevels.ADMIN
    );
    // Return the array sorted by locationRole and if is the same location role, sort by name
    return emp.sort((a, b) => {
      if (a.locationRole !== b.locationRole) {
        return a.locationRole - b.locationRole;
      }
      return a.fullName.localeCompare(b.fullName);
    });
  }, [searchQuery, selectedTag, getEmployees]);

  const columns = useMemo(
    (): TableColumnsType<RosterData> => [
      {
        title: t("Employee"),
        dataIndex: "employee",
        key: "employee",
        render: (_, { employee }) => employee.fullName,
      },
      {
        title: t("Position"),
        dataIndex: "position",
        key: "position",
        render: (_, { shift }) => shift.position,
      },
      {
        title: t("Start"),
        dataIndex: "start",
        key: "start",
        render: (_, { shift }) => shift.getStartDayjsDate.format("h:mm a"),
      },
      {
        title: t("End"),
        dataIndex: "end",
        key: "end",
        render: (_, { shift }) => shift.getEndDayjsDate.format("h:mm a"),
      },
      {
        title: t("Time"),
        dataIndex: "time",
        key: "time",
        render: (_, { shift }) => {
          return getDurationText(shift.shiftDuration.totalMinutes);
        },
      },
      {
        title: t("Overtime"),
        dataIndex: "overtime",
        key: "overtime",
        render: (_, { shift }) => {
          return getDurationText(shift.wageData.overtimeHours * 60);
        },
      },
      {
        title: t("Base pay"),
        dataIndex: "basePay",
        key: "basePay",
        render: (_, { shift }) => {
          return `$${shift.wageData.normalWage.toFixed(2)}`;
        },
      },
      {
        title: t("Overtime pay"),
        dataIndex: "overtimePay",
        key: "overtimePay",
        render: (_, { shift }) => {
          return `$${shift.wageData.overtimeWage.toFixed(2)}`;
        },
      },
      {
        title: t("Final wage"),
        dataIndex: "wage",
        key: "wage",
        render: (_, { shift }) => {
          return `$${shift.wageData.totalWage.toFixed(2)}`;
        },
      },
    ],
    [weekDays, employeeShiftsCollection]
  );

  const dataSource = useMemo(() => {
    const shiftsCollection: RosterData[] = [];
    employeeShiftsCollection
      .flatMap((sd) => ({
        employeeId: sd.employeeId,
        shiftsColl: sd.shiftsArray?.filter((sfts) =>
          sfts.getStartDayjsDate.isSame(weekDays[selectedDateIndex], "day")
        ),
      }))
      ?.forEach((shiftsDoc) => {
        shiftsDoc.shiftsColl.forEach((shift) => {
          shiftsCollection.push({
            shift,
            employee: employees.find((e) => e.id === shiftsDoc.employeeId),
          });
        });
      });

    return groupBy(shiftsCollection, ({ shift }) =>
      shift.getStartDayjsDate.format("a")
    );
  }, [employees, employeeShiftsCollection, weekDays, selectedDateIndex]);

  const currentWeekText = useMemo(() => {
    const year = Number.parseInt(weekId.split("-")[2]);
    const weekNo = Number.parseInt(weekId.split("-")[1]);
    const firstDayWeek = dayjs(weekToDate(year, weekNo, 1));
    const lastDayWeek = firstDayWeek.add(6, "days");
    return `${firstDayWeek.format("MMM DD")} - ${lastDayWeek.format("MMM DD")}`;
  }, [weekId]);

  const generatePDF = () => {
    const amRoster = dataSource["am"] ?? [];
    const pmRoster = dataSource["pm"] ?? [];
    generateRosterPdf(
      amRoster,
      pmRoster,
      weekId,
      weekDays[selectedDateIndex],
      location.name
    );
  };

  return (
    <Layout css={{ overflowX: "auto" }}>
      <GrayPageHeader
        onBack={() => navigate(-1)}
        title={t("Roster view")}
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
              {dayjs(weekDays[selectedDateIndex]).format("dddd, MM/DD/YY")}
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
            rowClassName={(e) => {
              if (e.shift.status === "draft" || e.shift.hasPendingUpdates) {
                return "edited";
              }
              if (e.shift.deleting) {
                return "deleting";
              }
              return "";
            }}
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
            rowClassName={(e) => {
              if (e.shift.status === "draft" || e.shift.hasPendingUpdates) {
                return "edited";
              }
              if (e.shift.deleting) {
                return "deleting";
              }
              return "";
            }}
          />
        </div>
      </Layout.Content>
    </Layout>
  );
}

export default RosterView;
