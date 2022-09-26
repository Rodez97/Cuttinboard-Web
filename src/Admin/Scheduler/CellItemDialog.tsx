/** @jsx jsx */
import { jsx } from "@emotion/react";
import dayjs from "dayjs";
import { deleteDoc } from "firebase/firestore";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { capitalize } from "lodash";
import { useScheduler } from "./Scheduler";
import ReadonlyShiftDialog from "./ReadonlyShiftDialog";
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
import {
  DeleteFilled,
  ExclamationCircleOutlined,
  PlusCircleFilled,
  ScheduleFilled,
} from "@ant-design/icons";
import styled from "@emotion/styled";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";

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
            </HoverListItem>
          )}
        />

        {isPublished || (
          <Button
            css={{ marginTop: 10 }}
            type="dashed"
            icon={<PlusCircleFilled />}
            onClick={handleOnAddShift}
            block
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
    </React.Fragment>
  );
}

export default CellItemDialog;
