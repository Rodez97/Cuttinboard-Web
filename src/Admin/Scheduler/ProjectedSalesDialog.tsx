/** @jsx jsx */
import { jsx } from "@emotion/react";
import { EditFilled, SaveFilled } from "@ant-design/icons";
import styled from "@emotion/styled";
import { Button, Descriptions, InputNumber, Modal } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";
import { getAnalytics, logEvent } from "firebase/analytics";
import { useSchedule } from "@cuttinboard-solutions/cuttinboard-library/schedule";

const ProjectedSalesTable = styled(Descriptions)`
  .ant-input-number {
    width: 100% !important;
  }
`;

function ProjectedSalesDialog({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const { weekDays, scheduleDocument } = useSchedule();
  const [editing, setEditing] = useState(false);
  const [projectedSalesByDay, setProjectedSalesByDay] = useState<
    Record<number, number>
  >({});

  const handleEditClick = async () => {
    if (editing) {
      setSaving(true);
      await save();
      setSaving(false);
      setEditing(false);
    } else {
      setEditing(true);
    }
  };

  const handleCancelClick = () => {
    if (editing) {
      setEditing(false);
      setProjectedSalesByDay({});
    } else {
      onClose();
    }
  };

  const handleInputChange = (weekDay: number, value: number) => {
    setProjectedSalesByDay({
      ...projectedSalesByDay,
      [weekDay]: value,
    });
  };

  const save = async () => {
    try {
      await scheduleDocument?.updateProjectedSales(projectedSalesByDay);
      // Report to analytics
      const analytics = getAnalytics();
      logEvent(analytics, "projected_sales_edited");
    } catch (error) {
      recordError(error);
    }
  };

  return (
    <Modal
      open={visible}
      footer={[
        <Button key="back" onClick={handleCancelClick} disabled={saving}>
          {editing ? t("Cancel") : "OK"}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={saving}
          onClick={handleEditClick}
          icon={editing ? <SaveFilled /> : <EditFilled />}
        >
          {editing ? t("Save") : t("Edit")}
        </Button>,
      ]}
      onCancel={onClose}
    >
      <ProjectedSalesTable
        title={t("Projected Sales")}
        column={1}
        bordered
        size="small"
      >
        {weekDays?.map((wd) => (
          <Descriptions.Item
            label={dayjs(wd).format("dddd")}
            key={dayjs(wd).isoWeekday()}
          >
            <InputNumber
              min={0}
              step={100}
              bordered={false}
              value={
                projectedSalesByDay?.[dayjs(wd).isoWeekday()] ??
                scheduleDocument?.projectedSalesByDay?.[
                  dayjs(wd).isoWeekday()
                ] ??
                0
              }
              formatter={(value) => `$ ${value}`}
              onChange={(val: number) =>
                handleInputChange(dayjs(wd).isoWeekday(), val)
              }
              disabled={!editing}
              css={{ width: "100% !important" }}
            />
          </Descriptions.Item>
        ))}
      </ProjectedSalesTable>
    </Modal>
  );
}

export default ProjectedSalesDialog;
