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
import RosterView from "./RosterView";
import ScheduleSummary from "./ScheduleSummary";
import WeekNavigator from "./WeekNavigator";
import {
  Employee,
  EmployeeShifts,
  Shift,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import {
  useEmployeesList,
  useLocation,
  useSchedule,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  Positions,
  WEEKFORMAT,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import Table, { ColumnsType } from "antd/lib/table";
import EmpColumnCell from "./EmpColumnCell";
import ShiftCell from "./ShiftCell";
import {
  Button,
  Descriptions,
  Input,
  Layout,
  message,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import TableFooter from "./TableFooter";
import {
  ExclamationCircleOutlined,
  FundProjectionScreenOutlined,
  ScheduleOutlined,
  TeamOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { recordError } from "../../utils/utils";
import "./Scheduler.scss";
import CloneSchedule from "./CloneSchedule";
import { GrayPageHeader } from "../../components/PageHeaders";
import ManageShiftDialog, { IManageShiftDialogRef } from "./ManageShiftDialog";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);
dayjs.extend(duration);

export interface IScheduleContextProps {
  editShift: (employee: Employee, shift: Shift) => void;
  newShift: (employee: Employee, date: Date) => void;
}

export const ScheduleContext = createContext<Partial<IScheduleContextProps>>(
  {}
);

export interface ShiftsTable {
  key: string;
  employee: Employee;
  empShifts: EmployeeShifts;
}

function Scheduler() {
  const {
    weekId,
    setWeekId,
    employeeShiftsCollection,
    publish,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    weekDays,
    updatesCount,
    error,
  } = useSchedule();
  const [projectedSalesOpen, setProjectedSalesOpen] = useState(false);
  const navigate = useNavigate();
  const manageShiftDialogRef = useRef<IManageShiftDialogRef>(null);
  const { t } = useTranslation();
  const [rosterMode, setRosterMode] = useState(false);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const { getEmployees } = useEmployeesList();
  const { location } = useLocation();

  const handleBack = () => {
    navigate(-1);
  };

  const employees = useMemo(() => {
    const byName = searchQuery
      ? matchSorter(getEmployees, searchQuery, {
          keys: [(e) => e.fullName],
        })
      : getEmployees;
    return selectedTag
      ? matchSorter(byName, selectedTag, {
          keys: [(e) => e.positions],
        })
      : byName;
  }, [searchQuery, selectedTag, getEmployees]);

  const togglePublishSchedule = async () => {
    let notifiTo: "all" | "all_scheduled" | "changed" | "none";
    Modal.confirm({
      title: t("Publish schedule changes"),
      icon: <ExclamationCircleOutlined />,
      content: (
        <Space direction="vertical" css={{ display: "flex" }}>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label={t("New or Draft:")}>
              {updatesCount.newOrDraft}
            </Descriptions.Item>

            <Descriptions.Item label={t("Shift Updates:")}>
              {updatesCount.pendingUpdates}
            </Descriptions.Item>

            <Descriptions.Item label={t("Deleted Shifts:")}>
              {updatesCount.deleted}
            </Descriptions.Item>

            <Descriptions.Item label={t("Total Changes:")}>
              {updatesCount.total}
            </Descriptions.Item>
          </Descriptions>

          <Typography.Title level={5}>{t("Notify to:")}</Typography.Title>

          <Select
            onChange={(e: "all" | "all_scheduled" | "changed" | "none") => {
              notifiTo = e;
            }}
            value={notifiTo}
            defaultValue="changed"
            css={{ width: "100%" }}
          >
            <Select.Option value="all">{t("All")}</Select.Option>
            <Select.Option value="all_scheduled">
              {t("all_scheduled")}
            </Select.Option>
            <Select.Option value="changed">{t("changed")}</Select.Option>
            <Select.Option value="none">{t("None")}</Select.Option>
          </Select>
        </Space>
      ),
      async onOk() {
        try {
          await publish(notifiTo ?? "changed");
          message.success(t("Changes Published"));
        } catch (error) {
          recordError(error);
        }
      },
      onCancel() {},
    });
  };

  const newShift = useCallback(
    (employee: Employee, column: Date) => {
      manageShiftDialogRef.current?.openNew(employee, column);
    },
    [manageShiftDialogRef.current]
  );

  const editShift = useCallback(
    (employee: Employee, shift: Shift) =>
      manageShiftDialogRef.current?.openEdit(employee, shift),
    [manageShiftDialogRef.current]
  );

  const columns = useMemo(
    (): ColumnsType<ShiftsTable> => [
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
      },
      ...weekDays.map((wd) => ({
        title: dayjs(wd).format("ddd DD"),
        dataIndex: dayjs(wd).isoWeekday(),
        key: dayjs(wd).isoWeekday(),
        render: (_, { employee, empShifts }: ShiftsTable) => (
          <ShiftCell
            employee={employee}
            shifts={empShifts?.shiftsArray.filter(
              (s) => s.shiftIsoWeekday === dayjs(wd).isoWeekday()
            )}
            date={wd}
            onNewShift={newShift}
          />
        ),
      })),
    ],
    [weekDays, employees, employeeShiftsCollection]
  );

  return (
    <ScheduleContext.Provider
      value={{
        editShift,
        newShift,
      }}
    >
      <Layout css={{ overflow: "auto" }}>
        <ManageShiftDialog ref={manageShiftDialogRef} />
        <GrayPageHeader
          onBack={handleBack}
          title={t("Schedule")}
          extra={[
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
              onClick={() => setRosterMode(!rosterMode)}
            >
              {t(rosterMode ? "See Schedule" : "See Roster")}
            </Button>,
            <Button
              key="1"
              icon={<UploadOutlined />}
              onClick={togglePublishSchedule}
              type="primary"
              disabled={
                updatesCount.total === 0 ||
                dayjs(weekDays[0]).isoWeek() > dayjs().add(1, "week").isoWeek()
              }
            >
              {`${t("Publish")} (${updatesCount.total})`}
            </Button>,
          ]}
          tags={
            Boolean(dayjs().format(WEEKFORMAT) === weekId) && [
              <Tag key="thisWeek" color="processing">
                {t("This Week")}
              </Tag>,
            ]
          }
        />

        <Space
          align="center"
          wrap
          css={{ justifyContent: "space-between", padding: 10 }}
        >
          <WeekNavigator onChange={setWeekId} currentWeekId={weekId} />
          <Space align="center" wrap>
            <Input.Search
              placeholder={t("Search")}
              allowClear
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              value={searchQuery}
              css={{ width: 200 }}
            />
            <Select
              showSearch
              style={{ width: 200 }}
              onSelect={setSelectedTag}
              onClear={() => setSelectedTag(null)}
              placeholder={t("Filter by position")}
              allowClear
            >
              {location.settings?.positions?.length && (
                <Select.OptGroup label={t("Custom")}>
                  {location.settings.positions.map((pos) => (
                    <Select.Option value={pos}>{pos}</Select.Option>
                  ))}
                </Select.OptGroup>
              )}

              <Select.OptGroup label={t("Default")}>
                {Positions.map((pos) => (
                  <Select.Option value={pos}>{pos}</Select.Option>
                ))}
              </Select.OptGroup>
            </Select>
          </Space>
        </Space>

        <ScheduleSummary />
        <div
          css={{
            width: "100vw",
            overflow: "auto",
            boxSizing: "border-box",
          }}
        >
          {rosterMode ? (
            <RosterView employees={employees} />
          ) : (
            <Table
              css={{
                width: "100%",
                position: "relative",
              }}
              bordered
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
              dataSource={employees?.map((emp) => ({
                key: emp.id,
                employee: emp,
                empShifts: employeeShiftsCollection?.find(
                  (shf) => shf.id === `${weekId}_${emp.id}_${location.id}`
                ),
              }))}
              summary={(pageData) => <TableFooter data={pageData} />}
              pagination={false}
              rowKey={(e) => e.employee.id}
              rowClassName="scheduler-row"
            />
          )}
        </div>
        <ProjectedSalesDialog
          visible={projectedSalesOpen}
          onClose={() => setProjectedSalesOpen(false)}
        />
        <CloneSchedule
          open={cloneDialogOpen}
          onCancel={() => setCloneDialogOpen(false)}
        />
      </Layout>
    </ScheduleContext.Provider>
  );
}

export const useScheduler = () => useContext(ScheduleContext);

export default Scheduler;
