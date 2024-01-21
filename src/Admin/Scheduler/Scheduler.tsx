/** @jsx jsx */
import { css, jsx } from "@emotion/react";
import dayjs from "dayjs";
import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import isoWeek from "dayjs/plugin/isoWeek";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isToday from "dayjs/plugin/isToday";
import { useTranslation } from "react-i18next";
import { matchSorter } from "match-sorter";
import ScheduleSummaryElement from "./ScheduleSummaryElement";
import WeekNavigator from "./WeekNavigator";
import EmpColumnCell from "./EmpColumnCell";
import ShiftCell from "./ShiftCell";
import { Input, Layout, Select } from "antd/es";
import TableFooter from "./TableFooter";
import {
  FundProjectionScreenOutlined,
  InfoCircleOutlined,
  ScheduleOutlined,
  SettingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import "./Scheduler.scss";
import "./ShiftTable.scss";
import ManageShiftDialog, { IManageShiftDialogRef } from "./ManageShiftDialog";
import { GrayPageHeader, LoadingPage } from "../../shared";
import {
  EmployeeShifts,
  checkShiftArrayChanges,
  useCuttinboardLocation,
  useDisclose,
  useLocationPermissions,
  useSchedule,
} from "@rodez97/cuttinboard-library";
import ShowLegend from "./ShowLegend";
import usePageTitle from "../../hooks/usePageTitle";
import { PositionSelect } from "../../shared/molecules/PositionSelect";
import ErrorPage from "../../shared/molecules/PageError";
import {
  checkEmployeePositions,
  getEmployeeFullName,
  IEmployee,
  IShift,
  RoleAccessLevels,
} from "@rodez97/types-helpers";
import PublishScheduleBtn from "./PublishScheduleBtn";
import ThisWeekTag from "./ThisWeekTag";
import PageHeaderButtons from "../../shared/molecules/PageHeaderButtons";
import ProjectedSalesDialog from "./ProjectedSalesDialog";
import CloneSchedule from "./CloneSchedule";
import ScheduleSettings from "../Settings/ScheduleSettings";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(isToday);

export interface ShiftsTable {
  key: string;
  employee: IEmployee;
  shifts: IShift[] | undefined;
}

function Scheduler() {
  usePageTitle("Scheduler");
  const { weekId, setWeekId, employeeShifts, weekDays, loading, error } =
    useSchedule();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { location } = useCuttinboardLocation();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [position, setPosition] = useState("");
  const manageShiftDialogRef = useRef<IManageShiftDialogRef>(null);
  const [projectedSalesOpen, setProjectedSalesOpen] = useState(false);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const checkPermission = useLocationPermissions();
  const [isSettingsOpen, openSettings, closeSettings] = useDisclose(false);

  const openNew = (employee: IEmployee, date: dayjs.Dayjs) => {
    manageShiftDialogRef.current?.openNew(employee, date);
  };

  const openEdit = (employee: IEmployee, shift: IShift) => {
    manageShiftDialogRef.current?.openEdit(employee, shift);
  };

  const columnFilter = useCallback((value: string, record: EmployeeShifts) => {
    if (value === "all_scheduled") {
      return Boolean(record.shifts && record.shifts.length > 0);
    }

    if (value === "changed") {
      return Boolean(record.shifts && checkShiftArrayChanges(record.shifts));
    }

    if (value === "staff_only") {
      return Boolean(record.employee.role === RoleAccessLevels.STAFF);
    }

    if (value === "managers_only") {
      return Boolean(record.employee.role === RoleAccessLevels.MANAGER);
    }

    return false;
  }, []);

  // Create an array of objects containing employee data and their shifts
  const shiftsSource = useMemo(() => {
    const byStatus =
      statusFilter && statusFilter !== "all"
        ? employeeShifts.filter((e) => columnFilter(statusFilter, e))
        : employeeShifts;

    const byName = searchQuery
      ? matchSorter(byStatus, searchQuery, {
          keys: [({ employee }) => getEmployeeFullName(employee)],
        })
      : byStatus;

    return position
      ? byName.filter((e) => checkEmployeePositions(e.employee, [position]))
      : byName;
  }, [columnFilter, employeeShifts, position, searchQuery, statusFilter]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPage error={error} />;
  }

  return (
    <Layout css={{ overflowX: "auto" }}>
      <GrayPageHeader
        backIcon={<InfoCircleOutlined />}
        onBack={ShowLegend}
        title={
          <span
            css={css`
              @media (max-width: 625px) {
                display: none;
              }
            `}
          >
            {t("Schedule")}
          </span>
        }
        extra={[
          <PageHeaderButtons
            key="pageHeaderButtons"
            mediaQuery="only screen and (max-width: 1280px)"
            items={[
              {
                key: "projectedSales",
                icon: <FundProjectionScreenOutlined />,
                onClick: () => setProjectedSalesOpen(true),
                label: t("Projected Sales"),
                type: "dashed",
              },
              {
                key: "clone",
                icon: <ScheduleOutlined />,
                onClick: () => setCloneDialogOpen(true),
                label: t("Clone Schedule"),
                type: "dashed",
              },
              {
                key: "navigateRoster",
                icon: <TeamOutlined />,
                onClick: () => navigate("roster"),
                label: t("See Roster"),
              },
              {
                key: "settings",
                icon: <SettingOutlined />,
                onClick: openSettings,
                label: t("Settings"),
                hidden: !checkPermission("manageScheduleSettings"),
              },
            ]}
          />,
          <PublishScheduleBtn key="publish" />,
        ]}
        tags={[<ThisWeekTag key="thisWeek" />]}
      />

      <div className="scheduler-toolbar">
        <WeekNavigator onChange={setWeekId} currentWeekId={weekId} />

        <div>
          <Select
            defaultValue="all"
            onChange={setStatusFilter}
            value={statusFilter}
            options={[
              {
                label: t("All Employees"),
                value: "all",
              },
              {
                label: t("Managers Only"),
                value: "managers_only",
              },
              {
                label: t("Staff Only"),
                value: "staff_only",
              },
              {
                label: t("Scheduled Only"),
                value: "all_scheduled",
              },
              {
                label: t("Changed"),
                value: "changed",
              },
            ]}
            className="scheduler-toolbar__sort-emp"
          />
          <PositionSelect
            onSelect={(pos) => (pos ? setPosition(pos) : setPosition(""))}
            positions={location.settings?.positions}
          />
          <Input.Search
            placeholder={t("Search")}
            allowClear
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            value={searchQuery}
            className="scheduler-toolbar__search"
          />
        </div>
      </div>

      <ScheduleSummaryElement />
      <Layout.Content css={{ minHeight: 100 }}>
        <div className="table-wrapper">
          <table className="shift-table">
            <thead>
              <tr>
                <th>{t("Employees")}</th>
                {weekDays.map((weekday) => (
                  <th
                    key={weekday.unix()}
                    className={weekday.isToday() ? "shift-th-today" : ""}
                  >
                    {weekday.format("dddd, MMM D")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shiftsSource.map(({ shifts, employee }, index) => (
                <tr key={employee.id + index}>
                  <th>
                    <EmpColumnCell
                      employee={employee}
                      empShifts={shifts}
                      key={employee.id}
                    />
                  </th>
                  {weekDays.map((weekday) => {
                    return (
                      <td key={weekday.toISOString()}>
                        <ShiftCell
                          key={`${employee.id}-${weekday.toISOString()}}`}
                          employee={employee}
                          allShifts={shifts || []}
                          column={weekday}
                          newShift={openNew}
                          editShift={openEdit}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <TableFooter />
          </table>
        </div>
      </Layout.Content>

      <ManageShiftDialog ref={manageShiftDialogRef} />
      <ProjectedSalesDialog
        visible={projectedSalesOpen}
        onClose={() => setProjectedSalesOpen(false)}
      />
      <CloneSchedule
        open={cloneDialogOpen}
        onCancel={() => setCloneDialogOpen(false)}
      />
      {checkPermission("manageScheduleSettings") && (
        <ScheduleSettings open={isSettingsOpen} onClose={closeSettings} />
      )}
    </Layout>
  );
}

export default Scheduler;
