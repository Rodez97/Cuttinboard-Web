/** @jsx jsx */
import { jsx } from "@emotion/react";
import ManageShiftDialog, {
  IManageShiftDialogRef,
} from "Admin/Scheduler/ManageShiftDialog";
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
import ProjectedSalesRow from "./ProjectedSalesRow";
import RosterView from "./RosterView";
import ScheduleSummary from "./ScheduleSummary";
import WeekNavigator from "./WeekNavigator";
import { Employee, Shift } from "@cuttinboard/cuttinboard-library/models";
import {
  getShiftDate,
  useCuttinboard,
  useEmployeesList,
  useLocation,
  useSchedule,
} from "@cuttinboard/cuttinboard-library/services";
import { Positions } from "@cuttinboard/cuttinboard-library/utils";
import Table, { ColumnsType } from "antd/lib/table";
import EmpColumnCell from "./EmpColumnCell";
import ShiftCell from "./ShiftCell";
import {
  AutoComplete,
  Button,
  Input,
  Layout,
  message,
  Modal,
  PageHeader,
  Space,
  Tag,
} from "antd";
import TableFooter from "./TableFooter";
import PageLoading from "../../components/PageLoading";
import {
  CheckCircleOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FundProjectionScreenOutlined,
  TeamOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { recordError } from "../../utils/utils";
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
  shifts: Shift[];
}

function Scheduler() {
  const {
    weekId,
    setWeekId,
    scheduleDocumentLoading,
    shiftsCollection,
    shiftsCollectionLoading,
    isPublished,
    togglePublish,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    weekDays,
  } = useSchedule();
  const [projectedSalesOpen, setProjectedSalesOpen] = useState(false);
  const navigate = useNavigate();
  const manageShiftDialogRef = useRef<IManageShiftDialogRef>(null);
  const [result, setResult] = useState<string[]>([]);
  const { t } = useTranslation();
  const [rosterMode, setRosterMode] = useState(false);
  const { getEmployees } = useEmployeesList();

  const handleBack = () => {
    navigate(-1);
  };

  const employees = useMemo(() => {
    const byName = searchQuery
      ? matchSorter(getEmployees, searchQuery, {
          keys: ["name", "lastName"],
        })
      : getEmployees;

    return selectedTag
      ? matchSorter(byName, selectedTag, {
          keys: ["positions"],
        })
      : byName;
  }, [searchQuery, selectedTag, getEmployees]);

  const togglePublishSchedule = async () => {
    if (isPublished) {
      Modal.confirm({
        title: t(
          "The entire schedule will be unpublished and team members won't be able to see it until it is republished. Proceed?"
        ),
        icon: <ExclamationCircleOutlined />,

        async onOk() {
          try {
            await togglePublish();
            if (!isPublished) {
              message.success(t("Schedule published"));
            }
          } catch (error) {
            recordError(error);
          }
        },
        onCancel() {},
      });
    }
  };

  const newShift = useCallback(
    (employee: Employee, column: Date) => {
      manageShiftDialogRef.current?.openNew(employee, column, weekId);
    },
    [manageShiftDialogRef.current]
  );

  const editShift = useCallback(
    (employee: Employee, shift: Shift) =>
      manageShiftDialogRef.current?.openEdit(employee, shift),
    [manageShiftDialogRef.current]
  );

  if (scheduleDocumentLoading || shiftsCollectionLoading) {
    return <PageLoading />;
  }

  const columns = useMemo(
    (): ColumnsType<ShiftsTable> => [
      {
        title: t("Employee"),
        dataIndex: "employee",
        key: "employee",
        render: (_, { employee, shifts }) => (
          <EmpColumnCell employee={employee} shifts={shifts} />
        ),
      },
      ...weekDays.map((wd) => ({
        title: dayjs(wd).format("ddd DD"),
        dataIndex: dayjs(wd).isoWeekday(),
        key: dayjs(wd).isoWeekday(),
        render: (_, { employee, shifts }: ShiftsTable) => (
          <ShiftCell
            employee={employee}
            shifts={shifts.filter(
              (s) => getShiftDate(s.start).day() === wd.getDay()
            )}
            date={wd}
            onNewShift={newShift}
          />
        ),
      })),
    ],
    [weekDays, employees, shiftsCollection]
  );

  const handleSearch = (value: string) => {
    let res: string[] = [];
    if (!value) {
      res = [];
    } else {
      const sortedPos = matchSorter(Positions, value);
      if (sortedPos.length) {
        res = sortedPos;
      } else {
        res = [value];
      }
    }
    setResult(res);
  };

  return (
    <Layout>
      <ScheduleContext.Provider
        value={{
          editShift,
          newShift,
        }}
      >
        <ManageShiftDialog ref={manageShiftDialogRef} />
        <PageHeader
          className="site-page-header-responsive"
          onBack={handleBack}
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
              key="2"
              icon={<TeamOutlined />}
              onClick={() => setRosterMode(!rosterMode)}
            >
              {t(rosterMode ? "See Schedule" : "See Roster")}
            </Button>,
            <Button
              key="1"
              icon={isPublished ? <EditOutlined /> : <UploadOutlined />}
              onClick={togglePublishSchedule}
              type="primary"
              danger={isPublished}
            >
              {t(isPublished ? "Edit" : "Publish")}
            </Button>,
          ]}
          tags={[
            <Tag
              key="publishStatus"
              color={isPublished ? "success" : "warning"}
              icon={isPublished ? <CheckCircleOutlined /> : <EditOutlined />}
            >
              {t(isPublished ? "Published" : "Unpublished")}
            </Tag>,
          ]}
        />

        <Space
          align="center"
          wrap
          style={{ justifyContent: "space-between", padding: 10 }}
        >
          <WeekNavigator onChange={setWeekId} currentWeekId={weekId} />
          <Space align="center" wrap>
            <Input.Search
              placeholder={t("Search")}
              allowClear
              onSearch={setSearchQuery}
              style={{ width: 200 }}
            />
            <AutoComplete
              style={{ width: 200 }}
              onSearch={handleSearch}
              placeholder={t("Filter by position")}
              onSelect={setSelectedTag}
            >
              {result.map((position: string) => (
                <AutoComplete.Option key={position} value={position}>
                  {position}
                </AutoComplete.Option>
              ))}
            </AutoComplete>
          </Space>
        </Space>

        <ScheduleSummary />
        {rosterMode ? (
          <RosterView employees={employees} />
        ) : (
          <Table
            bordered
            components={{
              body: {
                cell: ({ children, ...props }) => (
                  <td {...props} style={{ height: 1, padding: 2 }}>
                    {children}
                  </td>
                ),
              },
            }}
            columns={columns}
            dataSource={employees?.map((emp) => ({
              key: emp.id,
              employee: emp,
              shifts: shiftsCollection?.filter(
                (shf) => shf.employeeId === emp.id
              ),
            }))}
            summary={(pageData) => <TableFooter data={pageData} />}
            pagination={false}
          />
        )}

        <ProjectedSalesRow
          visible={projectedSalesOpen}
          onClose={() => setProjectedSalesOpen(false)}
        />
      </ScheduleContext.Provider>
    </Layout>
  );
}

export const useScheduler = () => useContext(ScheduleContext);

export default Scheduler;
