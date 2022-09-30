/** @jsx jsx */
import { jsx } from "@emotion/react";
import { EditFilled, SaveFilled } from "@ant-design/icons";
import { useSchedule } from "@cuttinboard-solutions/cuttinboard-library/services";
import styled from "@emotion/styled";
import { Button, Descriptions, InputNumber, Modal } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";

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
  const { weekDays, scheduleDocument, editProjectedSales } = useSchedule();
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
      await editProjectedSales(projectedSalesByDay);
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
          <Descriptions.Item label={dayjs(wd).format("dddd")} key={wd.getDay()}>
            <InputNumber
              min={0}
              step={100}
              bordered={false}
              value={
                projectedSalesByDay?.[wd.getDay()] ??
                scheduleDocument?.statsByDay?.[wd.getDay()]?.projectedSales ??
                0
              }
              formatter={(value) => `$ ${value}`}
              onChange={(val) => handleInputChange(wd.getDay(), val)}
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
