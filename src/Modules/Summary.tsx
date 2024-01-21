/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Empty, Layout, Typography } from "antd/es";
import UtensilsSummary from "./UtensilsSummary";
import { useTranslation } from "react-i18next";
import upperFirst from "lodash-es/upperFirst";
import dayjs from "dayjs";
import TasksSummary from "./TasksSummary";
import { useSummaryData } from "./useSummaryData";
import usePageTitle from "../hooks/usePageTitle";
import { useCuttinboardLocation } from "@rodez97/cuttinboard-library";
import { useNavigate } from "react-router-dom";

export default function Summary() {
  usePageTitle("Summary");
  const { t } = useTranslation();
  const [recurringTasksSummary, utensils, loading] = useSummaryData();
  const { employees } = useCuttinboardLocation();
  const navigate = useNavigate();

  return (
    <Layout.Content>
      <Typography.Title
        level={3}
        css={{
          marginLeft: 20,
          marginRight: 20,
        }}
      >
        {t("Today")}
        {". "}
        <Typography.Text
          type="secondary"
          css={{
            fontSize: "inherit",
          }}
        >
          {upperFirst(dayjs().format("dddd, MMMM DD, YYYY"))}
        </Typography.Text>
      </Typography.Title>

      {employees.length === 0 && (
        <Empty
          description={
            <span>
              {t("No employees in this location")}
              {". "}
              <a onClick={() => navigate("../employees", { replace: true })}>
                {t("Add Employee")}
              </a>
            </span>
          }
        />
      )}

      <TasksSummary {...{ recurringTasksSummary, loading }} />

      {/* <ScheduleSummary {...{ scheduleTodaySummary, loading }} /> */}

      <UtensilsSummary {...{ utensils, loading }} />
    </Layout.Content>
  );
}
