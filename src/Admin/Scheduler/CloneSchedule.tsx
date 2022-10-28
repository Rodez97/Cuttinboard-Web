/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  useEmployeesList,
  useSchedule,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { Alert, Avatar, Checkbox, List, Modal } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import isoWeek from "dayjs/plugin/isoWeek";
import advancedFormat from "dayjs/plugin/advancedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import WeekNavigator from "./WeekNavigator";
import { UserOutlined } from "@ant-design/icons";
import { recordError } from "../../utils/utils";
import { useTranslation } from "react-i18next";
import { WEEKFORMAT } from "@cuttinboard-solutions/cuttinboard-library/utils";
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

function CloneSchedule(props: { open: boolean; onCancel: () => void }) {
  const { t } = useTranslation();
  const { getEmployees } = useEmployeesList();
  const { cloneWeek, weekId } = useSchedule();
  const [isCloning, setIsCloning] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(dayjs().format(WEEKFORMAT));
  const [selectedEmployees, setSelectedEmployees] = useState(
    getEmployees.map((e) => e.id)
  );

  const handleSelectedEmpChange = (empId: string) => {
    if (selectedEmployees.includes(empId)) {
      setSelectedEmployees((prev) => prev.filter((e) => e !== empId));
    } else {
      setSelectedEmployees((prev) => [...prev, empId]);
    }
  };

  const clone = async () => {
    setIsCloning(true);
    try {
      await cloneWeek(selectedWeek, selectedEmployees);
      props.onCancel();
    } catch (error) {
      recordError(error);
    }
    setIsCloning(false);
  };

  return (
    <Modal
      title={t("Clone Schedule")}
      {...props}
      onOk={clone}
      confirmLoading={isCloning}
      okButtonProps={{ disabled: Boolean(weekId === selectedWeek) }}
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
      <List
        dataSource={getEmployees}
        renderItem={(emp) => (
          <List.Item
            key={emp.id}
            extra={
              <Checkbox
                checked={selectedEmployees.includes(emp.id)}
                onChange={() => handleSelectedEmpChange(emp.id)}
                disabled={Boolean(weekId === selectedWeek)}
              />
            }
          >
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} src={emp.getAvatar} />}
              title={emp.fullName}
            />
          </List.Item>
        )}
      />
    </Modal>
  );
}

export default CloneSchedule;
