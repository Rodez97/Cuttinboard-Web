/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useCallback } from "react";
import Icon, {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Dropdown, Modal, Tag, Tooltip, Typography } from "antd/es";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import mdiClockAlert from "@mdi/svg/svg/clock-alert.svg";
import mdiComment from "@mdi/svg/svg/comment-quote-outline.svg";
import { MouseEvent, useMemo } from "react";
import ShowLegend from "./ShowLegend";
import { useEmployeeWageData, useSchedule } from "@rodez97/cuttinboard-library";
import { ManageShiftsProps } from "./ShiftCell";
import {
  IEmployee,
  IShift,
  RoleAccessLevels,
  checkIfShiftsHaveChanges,
  getShiftDayjsDate,
  getShiftLatestData,
} from "@rodez97/types-helpers";

interface ShiftElementProps extends ManageShiftsProps {
  employee: IEmployee;
  column: dayjs.Dayjs;
  shift: IShift;
  index: number;
}

function ShiftElement({
  employee,
  column,
  shift,
  index,
  editShift,
  newShift,
}: ShiftElementProps) {
  const { t } = useTranslation();
  const { deleteShift, restoreShift, cancelShiftUpdate } = useSchedule();
  const wageData = useEmployeeWageData(employee.id);

  const handleOnAddShift = useCallback(() => {
    newShift(employee, column);
  }, [newShift, employee, column]);

  const handleOnEditShift = useCallback(() => {
    editShift(employee, shift);
  }, [editShift, employee, shift]);

  const handleDeleteShift = useCallback(() => {
    Modal.confirm({
      title: t("Are you sure to delete this shift?"),
      icon: <ExclamationCircleOutlined />,
      onOk() {
        deleteShift(shift);
      },
    });
  }, [deleteShift, shift, t]);

  const handleRestoreShift = useCallback(() => {
    restoreShift(shift);
  }, [restoreShift, shift]);

  const cancelPendingUpdate = useCallback(() => {
    Modal.confirm({
      title: t("Are you sure to cancel this update?"),
      content: t("The shift will be restored to the previous state"),
      icon: <ExclamationCircleOutlined />,
      onOk() {
        cancelShiftUpdate(shift);
      },
    });
  }, [cancelShiftUpdate, shift, t]);

  const handleOvertimeClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    ShowLegend();
  }, []);

  const shiftData = useMemo(() => getShiftLatestData(shift), [shift]);

  const handleNotesClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();

      Modal.info({
        title: t("Notes"),
        content: shiftData.notes,
        icon: <Icon component={mdiComment} />,
      });
    },
    [shiftData.notes, t]
  );

  const haveOvertime = useMemo(() => {
    const shiftWageData = wageData?.shifts.get(shift.id);
    return Boolean(shiftWageData && shiftWageData.wageData.overtimeHours > 0);
  }, [shift.id, wageData]);

  const shouldShowTag = useMemo(() => {
    const employeeRole = employee.role;
    return (
      employeeRole > RoleAccessLevels.GENERAL_MANAGER ||
      (employeeRole === RoleAccessLevels.GENERAL_MANAGER && shiftData.position)
    );
  }, [employee, shiftData.position]);

  return (
    <Dropdown
      menu={{
        items: [
          {
            label: t("Edit"),
            key: "edit",
            icon: <EditOutlined />,
            onClick: handleOnEditShift,
          },
          {
            label: t("Add Shift"),
            key: "new-shift",
            icon: <PlusOutlined />,
            onClick: handleOnAddShift,
          },
          {
            label: t("Cancel Update"),
            key: "cancel-update",
            icon: <CloseOutlined />,
            onClick: cancelPendingUpdate,
            style: { display: shift.pendingUpdate ? "block" : "none" },
          },
          shift.deleting
            ? {
                label: t("Cancel Delete"),
                key: "cancelDelete",
                icon: <CloseOutlined />,
                danger: true,
                onClick: handleRestoreShift,
              }
            : {
                label: t("Delete"),
                key: "delete",
                icon: <DeleteOutlined />,
                danger: true,
                onClick: handleDeleteShift,
              },
        ],
      }}
      trigger={["click"]}
    >
      <div
        className={`shift-element ${
          shiftData.deleting
            ? "deleting"
            : checkIfShiftsHaveChanges(shift)
            ? "draft"
            : ""
        } ${index !== 0 ? "has-top-margin" : ""}`}
      >
        <div className="shift-element__container">
          <Typography.Text className="shift-element__time">
            {`${getShiftDayjsDate(shiftData, "start")
              .format("h:mma")
              .replace("m", "")} - ${getShiftDayjsDate(shiftData, "end")
              .format("h:mma")
              .replace("m", "")}`}
          </Typography.Text>

          {shouldShowTag &&
            (shiftData.position &&
            shiftData.hourlyWage &&
            shiftData.hourlyWage > 0 ? (
              <Tag color="processing" className="shift-element__tag">
                {shiftData.position}
              </Tag>
            ) : shiftData.position ? (
              <Tooltip title={shiftData.position}>
                <Tag color="warning" className="shift-element__tag">
                  $0.00/hr
                </Tag>
              </Tooltip>
            ) : (
              <Tag color="error" className="shift-element__tag">
                {t("No position")}
              </Tag>
            ))}

          {haveOvertime && (
            <Icon
              component={mdiClockAlert}
              className="shift-element__overtime"
              onClick={handleOvertimeClick}
            />
          )}

          {shiftData.notes && (
            <Icon
              component={mdiComment}
              className="shift-element__notes"
              onClick={handleNotesClick}
            />
          )}
        </div>
      </div>
    </Dropdown>
  );
}

export default ShiftElement;
