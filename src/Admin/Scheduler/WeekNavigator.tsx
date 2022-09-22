import dayjs from "dayjs";
import React, { useMemo } from "react";
import isoWeek from "dayjs/plugin/isoWeek";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  WEEKFORMAT,
  weekToDate,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { Button, Space, Typography } from "antd";
import { LeftCircleOutlined, RightCircleOutlined } from "@ant-design/icons";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

interface IWeekNavigator {
  onChange: (weekId: string) => void;
  currentWeekId: string;
}

function WeekNavigator({ onChange, currentWeekId }: IWeekNavigator) {
  const forwardWeek = () => {
    const year = Number.parseInt(currentWeekId.split("-")[2]);
    const weekNo = Number.parseInt(currentWeekId.split("-")[1]);
    const firstDayWeek = weekToDate(year, weekNo, 1);
    onChange(dayjs(firstDayWeek).add(1, "week").format(WEEKFORMAT));
  };
  const backWeek = () => {
    const year = Number.parseInt(currentWeekId.split("-")[2]);
    const weekNo = Number.parseInt(currentWeekId.split("-")[1]);
    const firstDayWeek = weekToDate(year, weekNo, 1);
    onChange(dayjs(firstDayWeek).subtract(1, "week").format(WEEKFORMAT));
  };

  const textContent = useMemo(() => {
    const year = Number.parseInt(currentWeekId.split("-")[2]);
    const weekNo = Number.parseInt(currentWeekId.split("-")[1]);
    const firstDayWeek = dayjs(weekToDate(year, weekNo, 1));
    const lastDayWeek = firstDayWeek.add(6, "days");
    return `${firstDayWeek.format("MMM DD")} - ${lastDayWeek.format("MMM DD")}`;
  }, [currentWeekId]);
  return (
    <Space align="center" style={{ justifyContent: "center" }}>
      <Button
        onClick={backWeek}
        shape="circle"
        icon={<LeftCircleOutlined />}
        type="text"
      />
      <Typography.Text type="secondary" style={{ fontSize: 18 }}>
        {textContent}
      </Typography.Text>
      <Button
        onClick={forwardWeek}
        shape="circle"
        icon={<RightCircleOutlined />}
        type="text"
      />
    </Space>
  );
}

export default WeekNavigator;
