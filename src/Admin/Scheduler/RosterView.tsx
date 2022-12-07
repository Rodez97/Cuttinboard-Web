/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { Divider, Layout, Table, TableColumnsType, Tag } from "antd";
import { Button, Space, Typography } from "antd";
import {
  FilePdfOutlined,
  LeftCircleOutlined,
  RightCircleOutlined,
} from "@ant-design/icons";
import "./RosterView.scss";
import { capitalize, groupBy } from "lodash";
import { RoleAccessLevels } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { useNavigate } from "react-router-dom";
import { generateRosterPdf } from "./generatePdf";
import { GrayPageHeader } from "../../components";
import {
  Employee,
  useEmployeesList,
} from "@cuttinboard-solutions/cuttinboard-library/employee";
import {
  minutesToTextDuration,
  Shift,
  useSchedule,
  weekToDate,
} from "@cuttinboard-solutions/cuttinboard-library/schedule";
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library/services";

export type RosterData = {
  employee: Employee;
  shift: Shift;
};

function RosterView() {
  const navigate = useNavigate();
  const { employeeShiftsCollection, weekDays, weekId } = useSchedule();
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const { t } = useTranslation();
  const { getEmployees } = useEmployeesList();
  const { location } = useCuttinboardLocation();

  const employees = useMemo(() => {
    // Get all employees except the supervisor
    const emp = getEmployees.filter(
      (e) => e.locationRole !== RoleAccessLevels.ADMIN
    );
    // Return the array sorted by locationRole
    return emp.sort((a, b) => Number(a.locationRole) - Number(b.locationRole));
  }, [getEmployees]);

  const columns = useMemo(
    (): TableColumnsType<RosterData> => [
      {
        title: t("Employee"),
        dataIndex: "employee",
        key: "employee",
        render: (_, { employee }) => employee.fullName,
        sorter: {
          compare: (a, b, order) => {
            if (order === "ascend") {
              return a.employee.fullName.localeCompare(b.employee.fullName);
            }
            if (order === "descend") {
              return b.employee.fullName.localeCompare(a.employee.fullName);
            }
            return (
              Number(a.employee.locationRole) - Number(b.employee.locationRole)
            );
          },
        },
      },
      {
        title: t("Position"),
        dataIndex: "position",
        key: "position",
        render: (_, { shift }) =>
          shift.position ? (
            <Tag color="processing">{shift.position}</Tag>
          ) : (
            <Tag color="error">{t("No position")}</Tag>
          ),
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
          return minutesToTextDuration(shift.shiftDuration.totalMinutes);
        },
      },
      {
        title: t("Overtime"),
        dataIndex: "overtime",
        key: "overtime",
        render: (_, { shift }) => {
          return minutesToTextDuration(shift.wageData.overtimeHours * 60);
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
    [t]
  );

  const dataSource = useMemo(() => {
    const shiftsCollection: RosterData[] = [];
    employeeShiftsCollection
      .flatMap((sd) => ({
        employeeId: sd.employeeId,
        shiftsColl: sd.shiftsArray?.filter((shifts) =>
          shifts.getStartDayjsDate.isSame(weekDays[selectedDateIndex], "day")
        ),
      }))
      ?.forEach((shiftsDoc) => {
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
              {capitalize(
                dayjs(weekDays[selectedDateIndex]).format("dddd, MMMM DD, YYYY")
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
          />
        </div>
      </Layout.Content>
    </Layout>
  );
}

export default RosterView;
