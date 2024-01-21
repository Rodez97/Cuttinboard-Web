/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useCallback, useMemo } from "react";
import { List, Modal, Tag, Typography } from "antd/es";
import EmployeeSecondaryElement from "./EmployeeSecondaryElement";
import OwnerSecondaryElement from "./OwnerSecondaryElement";
import CuttinboardAvatar from "../../shared/atoms/Avatar";
import {
  getEmployeeFullName,
  IEmployee,
  IShift,
  RoleAccessLevels,
} from "@rodez97/types-helpers";
import { InfoCircleFilled } from "@ant-design/icons";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { useTranslation } from "react-i18next";
dayjs.extend(LocalizedFormat);

interface EmpColumnCellProps {
  employee: IEmployee;
  empShifts?: IShift[];
}

function EmpColumnCell({ employee, empShifts }: EmpColumnCellProps) {
  const { t } = useTranslation();

  const haveAvailabilitySettings = useMemo(() => {
    return (
      employee.weeklyAvailability &&
      Object.keys(employee.weeklyAvailability).length > 0 &&
      Object.values(employee.weeklyAvailability).some(
        ({ isAvailable }) => typeof isAvailable === "boolean"
      )
    );
  }, [employee.weeklyAvailability]);

  const showAvailability = useCallback(() => {
    if (
      !employee.weeklyAvailability ||
      !Object.keys(employee.weeklyAvailability).length
    ) {
      return;
    }
    Modal.info({
      title: (
        <span>
          {t("Availability")}:{" "}
          <Typography.Text underline>
            {getEmployeeFullName(employee)}
          </Typography.Text>
        </span>
      ),
      content: (
        <List
          dataSource={Object.entries(employee.weeklyAvailability).filter(
            ([, { isAvailable }]) => typeof isAvailable === "boolean"
          )}
          renderItem={(
            [day, { isAvailable, startTime, endTime, allDay }],
            index
          ) => {
            const weekDay = dayjs().day(parseInt(day)).format("dddd");
            const from = dayjs(startTime, "HH:mm").format("LT");
            const to = dayjs(endTime, "HH:mm").format("LT");
            const isAllDay = isAvailable === false && allDay === true;
            return (
              <List.Item
                key={index}
                extra={
                  <Tag color={isAvailable ? "green" : "red"}>
                    {t(isAvailable ? "Available" : "Not Available")}
                  </Tag>
                }
              >
                <List.Item.Meta
                  title={weekDay}
                  description={
                    isAllDay
                      ? t("All day")
                      : t(`From: {{from}} To: {{to}}`, {
                          from,
                          to,
                        })
                  }
                />
              </List.Item>
            );
          }}
        />
      ),
      okText: "Close",
      width: 400,
    });
  }, [employee, t]);

  return (
    <div className="employee-cell">
      <div className="employee-cell__content">
        <CuttinboardAvatar
          size={40}
          src={employee.avatar}
          alt={getEmployeeFullName(employee)}
        />
        <div className="employee-cell__content__secondary">
          <Typography.Text
            strong
            className="employee-cell__content__secondary__name"
          >
            {getEmployeeFullName(employee)}
          </Typography.Text>

          <div
            css={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              alignItems: "center",
            }}
          >
            {employee.role === RoleAccessLevels.OWNER ? (
              <OwnerSecondaryElement
                empShifts={empShifts}
                employeeId={employee.id}
              />
            ) : (
              <EmployeeSecondaryElement
                empShifts={empShifts}
                employeeId={employee.id}
              />
            )}

            {haveAvailabilitySettings && (
              <InfoCircleFilled
                css={{ color: "#1890ff", marginRight: 5, cursor: "pointer" }}
                onClick={showAvailability}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmpColumnCell;
