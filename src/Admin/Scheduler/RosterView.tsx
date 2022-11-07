/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useScheduler } from "./Scheduler";
import { useSchedule } from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  Employee,
  Shift,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { Divider, Table, TableColumnsType } from "antd";
import { Button, Space, Typography } from "antd";
import { LeftCircleOutlined, RightCircleOutlined } from "@ant-design/icons";
import { matchSorter } from "match-sorter";
import "./RosterView.scss";
import { groupBy } from "lodash";
import { getDurationText } from "./getDurationText";

type RosterData = {
  employee: Employee;
  shift: Shift;
};

function RosterView({ employees }: { employees: Employee[] }) {
  const { employeeShiftsCollection, weekDays, selectedTag, searchQuery } =
    useSchedule();
  const { editShift } = useScheduler();
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const { t } = useTranslation();

  const handleCellClick = ({ shift, employee }: RosterData) => {
    if (shift.getStartDayjsDate.isBefore(dayjs(), "week")) {
      return;
    }
    editShift(employee, shift);
  };

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
    const byName = searchQuery
      ? matchSorter(shiftsCollection, searchQuery, {
          keys: ["employee.fullName"],
        })
      : shiftsCollection;

    const byTag = selectedTag
      ? matchSorter(byName, selectedTag, {
          keys: ["shift.position"],
        })
      : byName;

    return groupBy(byTag, ({ shift }) => shift.getStartDayjsDate.format("a"));
  }, [
    employees,
    employeeShiftsCollection,
    weekDays,
    selectedDateIndex,
    searchQuery,
    selectedTag,
  ]);

  return (
    <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
      <Space
        align="center"
        wrap
        css={{ justifyContent: "center", padding: "10px 5px" }}
      >
        <Button
          onClick={() => setSelectedDateIndex((si) => (si === 0 ? 6 : si - 1))}
          shape="circle"
          icon={<LeftCircleOutlined />}
          type="text"
        />
        <Typography.Text type="secondary" css={{ fontSize: 18 }}>
          {dayjs(weekDays[selectedDateIndex]).format("dddd, MM/DD/YY")}
        </Typography.Text>
        <Button
          onClick={() => setSelectedDateIndex((si) => (si === 6 ? 0 : si + 1))}
          shape="circle"
          icon={<RightCircleOutlined />}
          type="text"
        />
      </Space>

      <div
        css={{
          minWidth: 400,
          maxWidth: 900,
          margin: "auto",
          width: "100%",
        }}
      >
        <Divider>{t("AM Shifts")}</Divider>

        <Table
          className="rosterTable"
          size="small"
          bordered
          columns={columns}
          dataSource={dataSource["am"]}
          onRow={(record) => {
            return {
              onClick: () => handleCellClick(record), // click row
            };
          }}
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
          onRow={(record) => {
            return {
              onClick: () => handleCellClick(record), // click row
            };
          }}
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
    </div>
  );
}

export default RosterView;
