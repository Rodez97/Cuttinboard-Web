/** @jsx jsx */
import { jsx } from "@emotion/react";
import dayjs from "dayjs";
import React from "react";
import { useTranslation } from "react-i18next";
import duration from "dayjs/plugin/duration";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { useSchedule } from "@cuttinboard-solutions/cuttinboard-library/services";
import { ShiftsTable } from "./Scheduler";
import { Space, Table, Typography } from "antd";
import { SummaryCell } from "./SummaryCell";
dayjs.extend(advancedFormat);
dayjs.extend(duration);

function TableFooter({ data }: { data: readonly ShiftsTable[] }) {
  const { t } = useTranslation();
  const { weekDays } = useSchedule();

  return (
    <Table.Summary.Row css={{ height: 150 }}>
      <Table.Summary.Cell index={0}>
        <Space direction="vertical" size="small">
          <Typography.Text strong>{t("SCHEDULED HOURS")}</Typography.Text>
          <Typography.Text strong>{t("EMPLOYEES")}</Typography.Text>
          <Typography.Text strong>{t("LABOR COST")}</Typography.Text>
          <Typography.Text strong>{t("LABOR %")}</Typography.Text>
        </Space>
      </Table.Summary.Cell>
      {weekDays.map((wd, i) => {
        return (
          <SummaryCell index={i + 1} key={i + 1} weekDay={wd} data={data} />
        );
      })}
    </Table.Summary.Row>
  );
}

export default TableFooter;
