/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Route, Routes, useNavigate } from "react-router-dom";
import {
  employeesSelectors,
  ScheduleProvider,
  useAppSelector,
} from "@cuttinboard-solutions/cuttinboard-library";
import { useTranslation } from "react-i18next";
import { lazy } from "react";
import EmptyExtended from "../../shared/molecules/EmptyExtended";

const Scheduler = lazy(() => import("./Scheduler"));
const RosterView = lazy(() => import("./RosterView"));

export default () => {
  const { t } = useTranslation();
  const employees = useAppSelector(employeesSelectors.selectAll);
  const navigate = useNavigate();

  if (employees.length === 0) {
    return (
      <EmptyExtended
        descriptions={[
          "Create efficient schedules and avoid overtime",
          "Publish and notify employees",
          "Visualize projected labor percentage",
          "Calculate daily and weekly wages",
        ]}
        description={
          <span>
            {t("No employees in this location")}
            {". "}
            <a onClick={() => navigate("../employees", { replace: true })}>
              {t("Add Employee")}
            </a>{" "}
            {t("before using the Scheduling tool")}
          </span>
        }
      />
    );
  }

  return (
    <ScheduleProvider>
      <Routes>
        <Route path="/" element={<Scheduler />} />
        <Route path="roster" element={<RosterView />} />
      </Routes>
    </ScheduleProvider>
  );
};
