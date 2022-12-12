/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Alert, Avatar, Checkbox, List, Modal } from "antd";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import isoWeek from "dayjs/plugin/isoWeek";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import WeekNavigator from "./WeekNavigator";
import { UserOutlined } from "@ant-design/icons";
import { recordError } from "../../utils/utils";
import { useTranslation } from "react-i18next";
import { WEEKFORMAT } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { getAnalytics, logEvent } from "firebase/analytics";
import { useEmployeesList } from "@cuttinboard-solutions/cuttinboard-library/employee";
import { useSchedule } from "@cuttinboard-solutions/cuttinboard-library/schedule";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

function CloneSchedule(props: { open: boolean; onCancel: () => void }) {
  const { t } = useTranslation();
  const { getEmployees } = useEmployeesList();
  const { cloneWeek, weekId, weekSummary } = useSchedule();
  const [isCloning, setIsCloning] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(dayjs().format(WEEKFORMAT));
  const [selectedEmployees, setSelectedEmployees] = useState(
    getEmployees.map((e) => e.id)
  );

  const handleSelectedEmpChange = useCallback(
    (empId: string) => {
      if (selectedEmployees.includes(empId)) {
        setSelectedEmployees((prev) => prev.filter((e) => e !== empId));
      } else {
        setSelectedEmployees((prev) => [...prev, empId]);
      }
    },
    [selectedEmployees]
  );

  const clone = async () => {
    try {
      setIsCloning(true);
      await cloneWeek(selectedWeek, selectedEmployees);
      props.onCancel();
      // Report to analytics
      const analytics = getAnalytics();
      logEvent(analytics, "clone_schedule", {
        noOfEmployees: selectedEmployees.length,
      });
    } catch (error) {
      recordError(error);
    } finally {
      setIsCloning(false);
    }
  };

  const canClone = useMemo(() => {
    // Return false if no employees are selected
    if (selectedEmployees.length === 0) {
      return false;
    }

    // Return false if the selected week is the current week
    if (selectedWeek === weekId) {
      return false;
    }

    // Return false if the current week has shifts scheduled
    if (weekSummary.total.totalShifts > 0) {
      return false;
    }

    // Otherwise, return true
    return true;
  }, [
    // The value of canClone depends on these values
    selectedEmployees.length,
    selectedWeek,
    weekId,
    weekSummary.total.totalShifts,
  ]);

  return (
    <Modal
      title={t("Clone Schedule")}
      {...props}
      onOk={clone}
      confirmLoading={isCloning}
      okButtonProps={{ disabled: !canClone }}
    >
      <div css={{ display: "flex", justifyContent: "center", margin: 10 }}>
        <WeekNavigator
          currentWeekId={selectedWeek}
          onChange={setSelectedWeek}
        />
      </div>

      {weekId === selectedWeek && (
        <Alert
          showIcon
          type="warning"
          message={t("Cannot clone the same week")}
        />
      )}
      {weekSummary.total.totalShifts > 0 && (
        <Alert
          css={{ marginTop: 10 }}
          showIcon
          type="warning"
          message={t("Cannot clone a week with shifts")}
        />
      )}
      <List
        css={{ maxHeight: "50vh", overflowY: "auto", marginTop: 10 }}
        dataSource={getEmployees}
        renderItem={(emp) => (
          <List.Item
            key={emp.id}
            extra={
              <Checkbox
                checked={selectedEmployees.includes(emp.id)}
                onChange={() => handleSelectedEmpChange(emp.id)}
                disabled={!canClone}
              />
            }
          >
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} src={emp.avatar} />}
              title={emp.fullName}
            />
          </List.Item>
        )}
      />
    </Modal>
  );
}

export default CloneSchedule;
