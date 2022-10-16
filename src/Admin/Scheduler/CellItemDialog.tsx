/** @jsx jsx */
import { jsx } from "@emotion/react";
import dayjs from "dayjs";
import React from "react";
import { useTranslation } from "react-i18next";
import { capitalize } from "lodash";
import { useScheduler } from "./Scheduler";
import {
  Employee,
  Shift,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import {
  getShiftDate,
  useLocation,
  useSchedule,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { RoleAccessLevels } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Avatar, Button, List, Modal } from "antd";
import Icon, {
  DeleteFilled,
  ExclamationCircleOutlined,
  PlusCircleFilled,
  ScheduleFilled,
} from "@ant-design/icons";
import styled from "@emotion/styled";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import mdiDeleteRestore from "@mdi/svg/svg/delete-restore.svg";
import { recordError } from "utils/utils";

const HoverListItem = styled(List.Item)`
  cursor: pointer;
  :hover {
    background-color: ${Colors.MainOnWhite};
  }
`;

interface CellItemDialogProps {
  shifts: Shift[];
  open?: boolean;
  onClose: () => void;
  employee: Employee;
  column: Date;
}

function CellItemDialog({
  shifts,
  open,
  onClose,
  employee,
  column,
}: CellItemDialogProps) {
  const { editShift, newShift } = useScheduler();
  const { t } = useTranslation();
  const { locationAccessKey } = useLocation();

  const handleShiftClick =
    (shift: Shift) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      onClose();
      editShift(employee, shift);
    };

  const handleOnClose = () => {
    onClose();
  };

  const handleOnAddShift = () => {
    onClose();
    newShift(employee, column);
  };

  const showPromiseConfirm = (
    shift: Shift,
    e: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    e.stopPropagation();
    Modal.confirm({
      title: t("Are you sure to delete this shift?"),
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        try {
          if (locationAccessKey.role <= RoleAccessLevels.MANAGER) {
            await shift.delete();
          }
        } catch {
          return console.log("Oops errors!");
        }
      },
      onCancel() {},
    });
  };

  const restoreShift = async (
    shift: Shift,
    e: React.MouseEvent<HTMLElement, MouseEvent>
  ) => {
    e.stopPropagation();
    try {
      await shift.restore();
    } catch (err) {
      recordError(err);
    }
  };

  const getShiftData = (shift: Shift = shifts[0]) => {
    let time = "";
    let shiftPosition = "";
    if (shift.hasPendingUpdates) {
      const { start, end, position } = shift.pendingUpdate;
      time = `${getShiftDate(start)
        .format("h:mma")
        .replace("m", "")} - ${getShiftDate(end)
        .format("h:mma")
        .replace("m", "")}`;
      shiftPosition = position;
    } else {
      time = `${shift.getStartDayjsDate
        .format("h:mma")
        .replace("m", "")} - ${shift.getEndDayjsDate
        .format("h:mma")
        .replace("m", "")}`;
      shiftPosition = shift.position;
    }
    return { time, shiftPosition };
  };

  return (
    <React.Fragment>
      <Modal
        onCancel={handleOnClose}
        open={open}
        title={capitalize(dayjs(column).format("MMMM DD, YYYY"))}
        footer={[
          <Button key="ok" onClick={onClose} type="primary">
            OK
          </Button>,
        ]}
      >
        <List
          dataSource={shifts}
          split
          renderItem={(shift, index) => (
            <HoverListItem
              key={index}
              extra={
                shift.deleting ? (
                  <Button
                    icon={<Icon component={mdiDeleteRestore} />}
                    type="primary"
                    onClick={(e) => restoreShift(shift, e)}
                  />
                ) : (
                  <Button
                    icon={<DeleteFilled />}
                    danger
                    onClick={(e) => showPromiseConfirm(shift, e)}
                  />
                )
              }
              onClick={handleShiftClick(shift)}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<ScheduleFilled />} />}
                title={getShiftData(shift).time}
                description={getShiftData(shift).shiftPosition}
              />
            </HoverListItem>
          )}
        />

        <Button
          css={{ marginTop: 10 }}
          type="dashed"
          icon={<PlusCircleFilled />}
          onClick={handleOnAddShift}
          block
        >
          {t("Add")}
        </Button>
      </Modal>
      {/* {shifts[selectedShiftIndex] && (
        <ReadonlyShiftDialog
          open={readonlyShiftDialogOpen}
          shift={shifts[selectedShiftIndex]}
          onClose={() => setReadonlyShiftDialogOpen(false)}
        />
      )} */}
    </React.Fragment>
  );
}

export default CellItemDialog;
