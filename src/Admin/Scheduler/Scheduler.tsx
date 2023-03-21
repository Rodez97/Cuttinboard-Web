/** @jsx jsx */
import { jsx } from "@emotion/react";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import isoWeek from "dayjs/plugin/isoWeek";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { useTranslation } from "react-i18next";
import { matchSorter } from "match-sorter";
import ProjectedSalesDialog from "./ProjectedSalesDialog";
import ScheduleSummaryElement from "./ScheduleSummaryElement";
import WeekNavigator from "./WeekNavigator";
import EmpColumnCell from "./EmpColumnCell";
import ShiftCell from "./ShiftCell";
import { Button, Input, Layout, message, Select, Tag, Tooltip } from "antd";
import TableFooter from "./TableFooter";
import {
  FilePdfOutlined,
  FundProjectionScreenOutlined,
  InfoCircleOutlined,
  ScheduleOutlined,
  SettingOutlined,
  TeamOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import "./Scheduler.scss";
import "./ShiftTable.scss";
import CloneSchedule from "./CloneSchedule";
import { useManageShiftDialog } from "./ManageShiftDialog";
import { GrayPageHeader, LoadingPage } from "../../shared";
import PublishDialog from "./PublishDialog";
import {
  useCuttinboardLocation,
  useDisclose,
  useSchedule,
} from "@cuttinboard-solutions/cuttinboard-library";
import ShowLegend from "./ShowLegend";
import usePageTitle from "../../hooks/usePageTitle";
import { generateSchedulePdf } from "./NewPDF";
import { PositionSelect } from "../../shared/molecules/PositionSelect";
import ErrorPage from "../../shared/molecules/PageError";
import ScheduleSettings from "../Settings/ScheduleSettings";
import {
  checkEmployeePositions,
  checkShiftArrayChanges,
  getEmployeeFullName,
  IEmployee,
  IShift,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);

export interface ShiftsTable {
  key: string;
  employee: IEmployee;
  shifts: IShift[] | undefined;
}

const dayjsToComparator = (date: dayjs.Dayjs) =>
  date.year() + date.isoWeek() / 100;

function Scheduler() {
  usePageTitle("Scheduler");
  const {
    weekId,
    setWeekId,
    employeeShifts,
    searchQuery,
    setSearchQuery,
    weekDays,
    updatesCount,
    setPosition,
    position,
    loading,
    error,
  } = useSchedule();
  const [projectedSalesOpen, setProjectedSalesOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const { location, role } = useCuttinboardLocation();
  const [publishDialogOpen, openPublish, closePublish] = useDisclose();
  const { openNew, openEdit, ManageShiftDialog } = useManageShiftDialog();
  const [statusFilter, setStatusFilter] = useState("all");
  const [isSettingsOpen, openSettings, closeSettings] = useDisclose(false);

  const columnFilter = useCallback((value: string, record: ShiftsTable) => {
    if (value === "all_scheduled") {
      return Boolean(record.shifts && record.shifts.length > 0);
    }

    if (value === "changed") {
      return Boolean(record.shifts && checkShiftArrayChanges(record.shifts));
    }

    if (value === "staff_only") {
      return Boolean(record.employee.role === RoleAccessLevels.STAFF);
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

  const generatePdf = useCallback(async () => {
    const empDocs = shiftsSource.filter(
      (e) => e.shifts && e.shifts.length > 0
    ) as {
      key: string;
      employee: IEmployee;
      shifts: IShift[];
    }[];
    if (empDocs.length === 0) {
      return message.error(t("There are no employees scheduled"));
    }
    await generateSchedulePdf(empDocs, location.name, weekId, weekDays);
  }, [shiftsSource, location.name, weekId, weekDays, t]);

  const cantPublish = useMemo(() => {
    const currentWeekNumberComparator = dayjsToComparator(weekDays[0]);
    const realWeekNumberComparator = dayjsToComparator(dayjs());
    const nextWeekNumberComparator = dayjsToComparator(dayjs().add(1, "week"));

    if (currentWeekNumberComparator < realWeekNumberComparator) {
      return "past_week";
    }

    if (updatesCount.total === 0) {
      return "no_changes";
    }

    if (currentWeekNumberComparator > nextWeekNumberComparator) {
      return "too_far";
    }

    return false;
  }, [updatesCount.total, weekDays]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPage error={new Error(error)} />;
  }

  return (
    <Layout css={{ overflowX: "auto" }}>
      <GrayPageHeader
        backIcon={<InfoCircleOutlined />}
        onBack={ShowLegend}
        title={t("Schedule")}
        extra={[
          <Button
            key="projectedSales"
            onClick={() => setProjectedSalesOpen(true)}
            type="dashed"
            icon={<FundProjectionScreenOutlined />}
          >
            {t("Projected Sales")}
          </Button>,
          <Button
            onClick={generatePdf}
            icon={<FilePdfOutlined />}
            key="generatePdf"
            type="dashed"
          >
            {t("Generate PDF")}
          </Button>,
          <Button
            key="clone"
            onClick={() => setCloneDialogOpen(true)}
            type="dashed"
            icon={<ScheduleOutlined />}
          >
            {t("Clone Schedule")}
          </Button>,
          <Button
            key="2"
            icon={<TeamOutlined />}
            onClick={() => navigate("roster")}
          >
            {t("See Roster")}
          </Button>,
          role < RoleAccessLevels.MANAGER && (
            <Button
              key="settings"
              icon={<SettingOutlined />}
              onClick={openSettings}
            >
              {t("Settings")}
            </Button>
          ),
          <Tooltip
            title={
              cantPublish === "too_far"
                ? t(
                    "You can't publish schedules that are more than 2 weeks in advance"
                  )
                : cantPublish === "past_week"
                ? t("You can't publish schedules for past weeks")
                : cantPublish === "no_changes"
                ? t("You can't publish schedules with no changes")
                : ""
            }
            key="1"
          >
            <Button
              icon={<UploadOutlined />}
              onClick={openPublish}
              type="primary"
              disabled={cantPublish !== false}
            >
              {`${t("Publish")} (${updatesCount.total})`}
            </Button>
          </Tooltip>,
        ]}
        tags={
          dayjs().isSame(weekDays[0], "day")
            ? [
                <Tag key="thisWeek" color="processing">
                  {t("This Week")}
                </Tag>,
              ]
            : []
        }
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
                  <th key={Math.random()}>{weekday.format("dddd, MMM D")}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shiftsSource.map(({ shifts, key, employee }) => (
                <tr key={key}>
                  <th>
                    <EmpColumnCell
                      employee={employee}
                      empShifts={shifts}
                      key={employee.id}
                    />
                  </th>
                  {weekDays.map((weekday) => {
                    return (
                      <td key={Math.random()}>
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
            <TableFooter data={shiftsSource} />
          </table>
        </div>
      </Layout.Content>

      {ManageShiftDialog}
      <ProjectedSalesDialog
        visible={projectedSalesOpen}
        onClose={() => setProjectedSalesOpen(false)}
      />
      <CloneSchedule
        open={cloneDialogOpen}
        onCancel={() => setCloneDialogOpen(false)}
      />
      <PublishDialog
        open={publishDialogOpen}
        onCancel={closePublish}
        onAccept={closePublish}
      />
      {role < RoleAccessLevels.MANAGER && (
        <ScheduleSettings open={isSettingsOpen} onClose={closeSettings} />
      )}
    </Layout>
  );
}

export default Scheduler;
