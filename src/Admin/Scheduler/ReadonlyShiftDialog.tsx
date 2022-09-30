import { Shift } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Button, Checkbox, Descriptions, Modal } from "antd";
import { capitalize } from "lodash";
import React from "react";
import { useTranslation } from "react-i18next";
import { getOrderedTasks } from "../../utils/utils";

interface ReadonlyShiftDialogProps {
  open: boolean;
  onClose: () => void;
  shift: Shift;
}

function ReadonlyShiftDialog({
  open,
  onClose,
  shift,
}: ReadonlyShiftDialogProps) {
  const { t } = useTranslation();
  return (
    <Modal
      visible={open}
      onCancel={onClose}
      title={t("Shift Details")}
      footer={[
        <Button key="ok" onClick={onClose} type="primary">
          OK
        </Button>,
      ]}
    >
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label={t("Date")}>
          {capitalize(shift.getStartDayjsDate.format("MMMM DD, YYYY"))}
        </Descriptions.Item>
        <Descriptions.Item label={t("Hours")}>
          {`${shift.getStartDayjsDate.format(
            "h:mm a"
          )} - ${shift.getEndDayjsDate.format("h:mm a")}`}
        </Descriptions.Item>
        {shift?.position && (
          <Descriptions.Item label={t("Position")}>
            {shift?.position}
          </Descriptions.Item>
        )}
        {shift?.hourlyWage && (
          <Descriptions.Item label={t("Hourly wage")}>
            {shift?.hourlyWage.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </Descriptions.Item>
        )}
        {shift?.notes && (
          <Descriptions.Item label={t("Notes")}>
            {shift?.notes}
          </Descriptions.Item>
        )}
        {Object.keys(shift?.tasks ?? {}).length > 0 && (
          <Descriptions.Item label={t("Tasks")}>
            {getOrderedTasks(shift?.tasks ?? {}).map(([id, task]) => {
              return (
                <>
                  <Checkbox checked={task.status} disabled>
                    {task.name}
                  </Checkbox>
                  <br />
                </>
              );
            })}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Modal>
  );
}

export default ReadonlyShiftDialog;
