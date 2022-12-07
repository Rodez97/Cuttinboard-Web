/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Layout, Typography } from "antd";
import { OverflowLayout } from "../components";
import AdminSummary from "./AdminSummary";
import UtensilsSummary from "./UtensilsSummary";
import { useTranslation } from "react-i18next";
import { capitalize } from "lodash";
import dayjs from "dayjs";
import TasksSummary from "./TasksSummary";

export default () => {
  const { t } = useTranslation();

  return (
    <OverflowLayout>
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
            {capitalize(dayjs().format("dddd, MMMM DD, YYYY"))}
          </Typography.Text>
        </Typography.Title>

        <TasksSummary />

        <AdminSummary />

        <UtensilsSummary />
      </Layout.Content>
    </OverflowLayout>
  );
};
