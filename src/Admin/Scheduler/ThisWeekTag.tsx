import { useSchedule } from "@rodez97/cuttinboard-library";
import dayjs from "dayjs";
import React from "react";
import isoWeek from "dayjs/plugin/isoWeek";
import { useTranslation } from "react-i18next";
import { Tag } from "antd/es";
dayjs.extend(isoWeek);

function ThisWeekTag() {
  const { t } = useTranslation();
  const { weekDays } = useSchedule();

  return dayjs().isSame(weekDays[0], "isoWeek") ? (
    <Tag key="thisWeek" color="processing">
      {t("This week")}
    </Tag>
  ) : null;
}

export default ThisWeekTag;
