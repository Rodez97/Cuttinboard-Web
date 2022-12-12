/** @jsx jsx */
import { jsx } from "@emotion/react";
import dayjs from "dayjs";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import isoWeek from "dayjs/plugin/isoWeek";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useTranslation } from "react-i18next";
import duration from "dayjs/plugin/duration";
import { matchSorter } from "match-sorter";
import ProjectedSalesDialog from "./ProjectedSalesDialog";
import ScheduleSummaryElement from "./ScheduleSummaryElement";
import WeekNavigator from "./WeekNavigator";
import EmpColumnCell from "./EmpColumnCell";
import ShiftCell from "./ShiftCell";
import {
  Button,
  Empty,
  Input,
  Layout,
  Space,
  Table,
  TableColumnsType,
  Tag,
  Tooltip,
} from "antd";
import TableFooter from "./TableFooter";
import {
  FilePdfOutlined,
  FundProjectionScreenOutlined,
  ScheduleOutlined,
  TeamOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import "./Scheduler.scss";
import CloneSchedule from "./CloneSchedule";
import ManageShiftDialog, { IManageShiftDialogRef } from "./ManageShiftDialog";
import { generateSchedulePdf } from "./generatePdf";
import { GrayPageHeader, PageError, LoadingPage } from "../../shared";
import { useResizeDetector } from "react-resize-detector";
import { capitalize, compact, uniq } from "lodash";
import PublishDialog from "./PublishDialog";
import {
  Employee,
  useEmployeesList,
} from "@cuttinboard-solutions/cuttinboard-library/employee";
import {
  EmployeeShifts,
  Shift,
  useSchedule,
} from "@cuttinboard-solutions/cuttinboard-library/schedule";
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  POSITIONS,
  RoleAccessLevels,
  useDisclose,
  WEEKFORMAT,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(duration);

export interface IScheduleContextProps {
  editShift: (employee: Employee, shift: Shift) => void;
  newShift: (employee: Employee, date: Date) => void;
}

export const ScheduleContext = createContext<IScheduleContextProps>(
  {} as IScheduleContextProps
);

export interface ShiftsTable {
  key: string;
  employee: Employee;
  empShifts: EmployeeShifts | undefined;
}

function Scheduler() {
  const { ref, height } = useResizeDetector();
  const {
    weekId,
    setWeekId,
    employeeShiftsCollection,
    searchQuery,
    setSearchQuery,
    weekDays,
    updates,
  } = useSchedule();
  const [projectedSalesOpen, setProjectedSalesOpen] = useState(false);
  const navigate = useNavigate();
  const manageShiftDialogRef = useRef<IManageShiftDialogRef>(null);
  const { t } = useTranslation();
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const {
    getEmployees,
    loading: employeesLoading,
    error: employeesError,
  } = useEmployeesList();
  const { location } = useCuttinboardLocation();
  const [publishDialogOpen, openPublish, closePublish] = useDisclose();

  const employees = useMemo(() => {
    // Get all employees except the supervisor
    const emp = getEmployees.filter(
      (e) => e.locationRole !== RoleAccessLevels.ADMIN
    );

    const byName = searchQuery
      ? matchSorter(emp, searchQuery, {
          keys: [(e) => e.fullName],
        })
      : emp;
    // Return the array sorted by locationRole and if is the same location role, sort by name
    return byName.sort((a, b) => {
      if (a.locationRole !== b.locationRole) {
        return Number(a.locationRole) - Number(b.locationRole);
      }
      return a.fullName.localeCompare(b.fullName);
    });
  }, [searchQuery, getEmployees]);

  const newShift = useCallback((employee: Employee, column: Date) => {
    manageShiftDialogRef.current?.openNew(employee, column);
  }, []);

  const editShift = useCallback(
    (employee: Employee, shift: Shift) =>
      manageShiftDialogRef.current?.openEdit(employee, shift),
    []
  );

  const generatePdf = useCallback(async () => {
    const empDocs = compact(
      employees.map((employee) => {
        const empShifts = employeeShiftsCollection?.find(
          (shf) => shf.id === `${weekId}_${employee.id}_${location.id}`
        );
        if (!empShifts) {
          return null;
        }
        return {
          key: employee.id,
          employee,
          empShifts,
        };
      })
    );
    generateSchedulePdf(empDocs, location.name, weekId, weekDays);
  }, [
    employees,
    location.name,
    location.id,
    weekId,
    weekDays,
    employeeShiftsCollection,
  ]);

  const columns = useMemo<TableColumnsType<ShiftsTable>>(
    () => [
      {
        title: t("Employee"),
        dataIndex: "employee",
        key: "employee",
        render: (_, { employee, empShifts }) => (
          <EmpColumnCell employee={employee} empShifts={empShifts} />
        ),
        fixed: "left",
        width: 250,
        className: "employee-column",
        filters: [
          {
            text: t("Scheduled Only"),
            value: "all_scheduled",
          },
          {
            text: t("Changed"),
            value: "changed",
          },
          {
            text: t("Staff Only"),
            value: "staff_only",
          },
          {
            text: t("Positions"),
            value: "positions",
            children: uniq([
              ...POSITIONS,
              ...(location.settings?.positions ?? []),
            ])
              .sort((a, b) => a.localeCompare(b))
              .map((pos) => ({
                text: pos,
                value: pos,
              })),
          },
        ],
        onFilter: (value: string, record) => {
          if (value === "all_scheduled") {
            return Boolean(
              record.empShifts && record.empShifts.shiftsArray.length > 0
            );
          }

          if (value === "changed") {
            return Boolean(record.empShifts && record.empShifts.haveChanges);
          }

          if (value === "staff_only") {
            return Boolean(
              record.employee.locationRole === RoleAccessLevels.STAFF
            );
          }

          if (value) {
            return record.employee.hasAnyPosition([value]);
          }

          return true;
        },
      },
      ...weekDays.map((wd) => ({
        title: capitalize(dayjs(wd).format("ddd DD")),
        dataIndex: dayjs(wd).isoWeekday(),
        key: dayjs(wd).isoWeekday(),
        render: (_, { employee, empShifts }: ShiftsTable) => (
          <ShiftCell
            employee={employee}
            allShifts={empShifts?.shiftsArray}
            date={wd}
          />
        ),
      })),
    ],
    [location.settings?.positions, t, weekDays]
  );

  const shiftsSource = useMemo(() => {
    if (!employees) {
      return [];
    }
    return employees.map((employee) => {
      const empShifts = employeeShiftsCollection?.find(
        (shf) => shf.id === `${weekId}_${employee.id}_${location.id}`
      );
      return {
        key: employee.id,
        employee,
        empShifts,
      };
    });
  }, [employeeShiftsCollection, employees, location.id, weekId]);

  if (employeesLoading) {
    return <LoadingPage />;
  }

  if (employeesError) {
    return <PageError error={employeesError} />;
  }

  return (
    <ScheduleContext.Provider
      value={{
        editShift,
        newShift,
      }}
    >
      <Layout css={{ overflowX: "auto" }}>
        <GrayPageHeader
          title={t("Schedule")}
          extra={[
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
              key="projectedSales"
              onClick={() => setProjectedSalesOpen(true)}
              type="dashed"
              icon={<FundProjectionScreenOutlined />}
            >
              {t("Projected Sales")}
            </Button>,
            <Button
              key="2"
              icon={<TeamOutlined />}
              onClick={() => navigate("roster")}
            >
              {t("See Roster")}
            </Button>,
            <Tooltip
              title={
                dayjs(weekDays[0]).isoWeek() >
                  dayjs().add(1, "week").isoWeek() &&
                t(
                  "You can't publish schedules that are more than 2 weeks in advance"
                )
              }
              key="1"
            >
              <Button
                icon={<UploadOutlined />}
                onClick={openPublish}
                type="primary"
                disabled={
                  updates.total === 0 ||
                  dayjs(weekDays[0]).isoWeek() >
                    dayjs().add(1, "week").isoWeek()
                }
              >
                {`${t("Publish")} (${updates.total})`}
              </Button>
            </Tooltip>,
          ]}
          tags={
            dayjs().format(WEEKFORMAT) === weekId
              ? [
                  <Tag key="thisWeek" color="processing">
                    {t("This Week")}
                  </Tag>,
                ]
              : []
          }
        />

        <Space
          align="center"
          wrap
          css={{ justifyContent: "space-between", padding: 10 }}
        >
          <WeekNavigator onChange={setWeekId} currentWeekId={weekId} />

          <Input.Search
            placeholder={t("Search")}
            allowClear
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            value={searchQuery}
            css={{ width: 200 }}
          />
        </Space>
        <ScheduleSummaryElement />
        <Layout.Content css={{ minHeight: 100 }} ref={ref}>
          {employees.length > 0 ? (
            <Table
              scroll={height ? { x: 1300, y: height - 39 * 3 } : { x: 1300 }}
              css={{ height: "100%" }}
              bordered
              size="small"
              components={{
                body: {
                  cell: ({ children, ...props }) => (
                    <td {...props} className="shift-cell">
                      {children}
                    </td>
                  ),
                },
              }}
              columns={columns}
              dataSource={shiftsSource}
              summary={(pageData) => (
                <Table.Summary fixed>
                  <TableFooter data={pageData} />
                </Table.Summary>
              )}
              pagination={false}
              rowKey={(e) => e.employee.id}
              rowClassName="scheduler-row"
            />
          ) : (
            <Empty
              description={t("No employees found")}
              css={{
                marginTop: 50,
              }}
            />
          )}
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
        <PublishDialog
          open={publishDialogOpen}
          onCancel={closePublish}
          onAccept={closePublish}
        />
      </Layout>
    </ScheduleContext.Provider>
  );
}

export const useScheduler = () => useContext(ScheduleContext);

export default Scheduler;
