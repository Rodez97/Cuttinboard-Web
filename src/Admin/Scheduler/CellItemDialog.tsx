import dayjs from "dayjs";
import { deleteDoc } from "firebase/firestore";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { capitalize } from "lodash";
import { useScheduler } from "./Scheduler";
import ReadonlyShiftDialog from "./ReadonlyShiftDialog";
import { Employee, Shift } from "@cuttinboard/cuttinboard-library/models";
import {
  getShiftDate,
  useLocation,
  useSchedule,
} from "@cuttinboard/cuttinboard-library/services";
import { RoleAccessLevels } from "@cuttinboard/cuttinboard-library/utils";
import { Avatar, Button, List, Modal, Popconfirm } from "antd";
import {
  DeleteFilled,
  ExclamationCircleOutlined,
  PlusCircleFilled,
  ScheduleFilled,
} from "@ant-design/icons";

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
  const { isPublished } = useSchedule();
  const { editShift, newShift } = useScheduler();
  const { t } = useTranslation();
  const [selectedShiftIndex, setSelectedShiftIndex] = useState(-1);
  const { locationAccessKey } = useLocation();
  const [readonlyShiftDialogOpen, setReadonlyShiftDialogOpen] = useState(false);

  const handleShiftClick =
    (shift: Shift, index: number) =>
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      onClose();
      if (isPublished) {
        setSelectedShiftIndex(index);
        setReadonlyShiftDialogOpen(true);
      } else {
        editShift(employee, shift);
      }
    };

  const handleOnClose = () => {
    onClose();
  };

  const handleOnAddShift = () => {
    onClose();
    newShift(employee, column);
  };

  const showPromiseConfirm = (shift: Shift) => {
    Modal.confirm({
      title: t("Are you sure to delete this shift?"),
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        try {
          return await new Promise<void>(async (resolve) => {
            if (locationAccessKey.role <= RoleAccessLevels.MANAGER) {
              await deleteDoc(shift.docRef);
            }
            resolve();
            onClose();
          });
        } catch {
          return console.log("Oops errors!");
        }
      },
      onCancel() {},
    });
  };

  return (
    <>
      <Modal
        onCancel={handleOnClose}
        visible={open}
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
            <List.Item
              key={shift[0]}
              actions={
                isPublished
                  ? []
                  : [
                      <Button
                        icon={<DeleteFilled />}
                        danger
                        onClick={() => showPromiseConfirm(shift)}
                      />,
                    ]
              }
              onClick={handleShiftClick(shift, index)}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<ScheduleFilled />} />}
                title={`${getShiftDate(shift.start)
                  .format("h:mma")
                  .replace("m", "")} - ${getShiftDate(shift.end)
                  .format("h:mma")
                  .replace("m", "")}`}
                description={shift.position}
              />
            </List.Item>
          )}
        />

        {isPublished || (
          <Button
            type="dashed"
            icon={<PlusCircleFilled />}
            onClick={handleOnAddShift}
            style={{ width: "100%" }}
          >
            {t("Add")}
          </Button>
        )}
      </Modal>
      {shifts[selectedShiftIndex] && (
        <ReadonlyShiftDialog
          open={readonlyShiftDialogOpen}
          shift={shifts[selectedShiftIndex]}
          onClose={() => setReadonlyShiftDialogOpen(false)}
        />
      )}
    </>
  );
}

export default CellItemDialog;
