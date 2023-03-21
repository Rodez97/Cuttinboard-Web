/** @jsx jsx */
import { jsx } from "@emotion/react";
import dayjs from "dayjs";
import { Tooltip, Typography } from "antd";
import calendar from "dayjs/plugin/calendar";
dayjs.extend(calendar);

export function GroupHeadingText({
  name,
  createdAtDate,
}: {
  name: string;
  createdAtDate: dayjs.Dayjs;
}) {
  return (
    <div>
      <Typography.Text
        strong
        css={{
          margin: "0px 2px",
          fontSize: "1rem",
        }}
      >
        {name}
      </Typography.Text>

      <Tooltip
        placement="top"
        title={createdAtDate.format("MM/DD/YYYY h:mm A")}
      >
        <Typography.Text
          css={{
            fontSize: "0.75rem",
            marginLeft: "0.50rem",
            color: "#00000070",
          }}
        >
          {createdAtDate.calendar()}
        </Typography.Text>
      </Tooltip>
    </div>
  );
}
