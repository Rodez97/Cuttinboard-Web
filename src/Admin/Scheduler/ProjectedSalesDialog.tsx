/** @jsx jsx */
import { jsx } from "@emotion/react";
import { EditFilled, SaveFilled } from "@ant-design/icons";
import styled from "@emotion/styled";
import { Button, Descriptions, InputNumber, Modal } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSchedule } from "@cuttinboard-solutions/cuttinboard-library";
import { logAnalyticsEvent } from "firebase";

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
  const { weekDays, summaryDoc, updateProjectedSales } = useSchedule();
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
    updateProjectedSales(projectedSalesByDay);
    // Report to analytics
    logAnalyticsEvent("schedule_projected_sales_changed", projectedSalesByDay);
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
        {weekDays.map((wd) => {
          const weekDay = wd.isoWeekday();
          return (
            <Descriptions.Item label={wd.format("dddd")} key={weekDay}>
              <InputNumber
                min={0}
                step={100}
                bordered={false}
                value={
                  projectedSalesByDay?.[weekDay] ??
                  summaryDoc?.projectedSalesByDay?.[weekDay] ??
                  0
                }
                formatter={(value) => `$ ${value}`}
                onChange={(val: number) => handleInputChange(weekDay, val)}
                disabled={!editing}
                css={{ width: "100% !important" }}
              />
            </Descriptions.Item>
          );
        })}
      </ProjectedSalesTable>
    </Modal>
  );
}

export default ProjectedSalesDialog;
