import dayjs from "dayjs";
import React, { useMemo } from "react";
import isoWeek from "dayjs/plugin/isoWeek";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Button, Space, Typography } from "antd/es";
import { LeftCircleOutlined, RightCircleOutlined } from "@ant-design/icons";
import upperFirst from "lodash-es/upperFirst";
import { WEEKFORMAT } from "@rodez97/types-helpers";
import { parseWeekId } from "@rodez97/cuttinboard-library";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

interface IWeekNavigator {
  onChange: (weekId: string) => void;
  currentWeekId: string;
}

function WeekNavigator({ onChange, currentWeekId }: IWeekNavigator) {
  const forwardWeek = () => {
    const { start } = parseWeekId(currentWeekId);
    onChange(start.add(1, "week").format(WEEKFORMAT));
  };
  const backWeek = () => {
    const { start } = parseWeekId(currentWeekId);
    onChange(start.subtract(1, "week").format(WEEKFORMAT));
  };

  const textContent = useMemo(() => {
    const { start, end } = parseWeekId(currentWeekId);

    const firstDayWeek = upperFirst(start.format("MMMM DD"));
    const lastDayWeek = upperFirst(end.format("MMMM DD, YYYY"));
    return `${firstDayWeek} - ${lastDayWeek}`;
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
