/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useScheduler } from "./Scheduler";
import {
  getShiftDate,
  useSchedule,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  Employee,
  Shift,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import Table, { ColumnsType } from "antd/lib/table";
import { Button, Space, Typography } from "antd";
import { LeftCircleOutlined, RightCircleOutlined } from "@ant-design/icons";
import { matchSorter } from "match-sorter";

type RosterData = {
  employee: Employee;
  shift: Shift;
};

function RosterView({ employees }: { employees: Employee[] }) {
  const { isPublished, shiftsCollection, weekDays, selectedTag, searchQuery } =
    useSchedule();
  const { editShift } = useScheduler();
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const { t } = useTranslation();

  const handleCellClick = ({ shift, employee }: RosterData) => {
    if (
      getShiftDate(shift.start).isBefore(dayjs(dayjs().startOf("isoWeek"))) ||
      isPublished
    ) {
      return;
    }
    editShift(employee, shift);
  };

  const columns = useMemo(
    (): ColumnsType<RosterData> => [
      {
        title: t("Employee"),
        dataIndex: "employee",
        key: "employee",
        render: (_, { employee }) => `${employee.name} ${employee.lastName}`,
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
        render: (_, { shift }) => getShiftDate(shift.start).format("h:mm a"),
      },
      {
        title: t("End"),
        dataIndex: "end",
        key: "end",
        render: (_, { shift }) => getShiftDate(shift.end).format("h:mm a"),
      },
      {
        title: t("Time"),
        dataIndex: "time",
        key: "time",
        render: (_, { shift }) => {
          const start = dayjs(getShiftDate(shift?.start));
          const end = dayjs(getShiftDate(shift?.end));
          return dayjs.duration(end.diff(start)).format("[🕘] H[h] m[min]");
        },
      },
    ],
    [weekDays, shiftsCollection]
  );

  const dataSource = useMemo(() => {
    const shifts = shiftsCollection
      ?.filter(
        (shf) =>
          getShiftDate(shf.start).day() === weekDays[selectedDateIndex].getDay()
      )
      ?.map((shift) => ({
        shift,
        employee: employees.find((e) => e.id === shift.employeeId),
      }));
    const byName = searchQuery
      ? matchSorter(shifts, searchQuery, {
          keys: ["employee.name", "employee.lastName"],
        })
      : shifts;

    return selectedTag
      ? matchSorter(byName, selectedTag, {
          keys: ["shift.position"],
        })
      : byName;
  }, [
    employees,
    shiftsCollection,
    weekDays,
    selectedDateIndex,
    searchQuery,
    selectedTag,
  ]);

  return (
    <React.Fragment>
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

      <Table
        size="small"
        bordered
        columns={columns}
        dataSource={dataSource}
        onRow={(record) => {
          return {
            onClick: () => handleCellClick(record), // click row
          };
        }}
        pagination={false}
        rowKey={(e) => e.shift.id}
      />
    </React.Fragment>
  );
}

export default RosterView;
