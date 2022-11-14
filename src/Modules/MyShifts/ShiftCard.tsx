/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { useTranslation } from "react-i18next";
import { Shift } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Button, List, Modal, Space, Tag } from "antd";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import Icon, { OrderedListOutlined } from "@ant-design/icons";
import { Note } from "../Notes/notesIcons";
import { recordError } from "../../utils/utils";
import { SimpleTodo } from "../../components";
dayjs.extend(advancedFormat);
dayjs.extend(duration);

interface ShiftCardProps {
  shift: Shift;
}

function ShiftCard({ shift }: ShiftCardProps) {
  const { t } = useTranslation();
  const [tasksDialogOpen, setTasksDialogOpen] = useState(false);

  const handleTaskChange = async (taskId: string, newStatus: boolean) => {
    try {
      await shift.changeTask(taskId, newStatus);
    } catch (error) {
      recordError(error);
    }
  };

  const handleSaveTasks = async () => {
    setTasksDialogOpen(false);
  };

  const getHours = () => {
    return dayjs
      .duration(shift.shiftDuration.totalMinutes, "minutes")
      .format(`H [${t("hours")}] mm [${t("minutes")}]`);
  };

  const showNotes = () => {
    Modal.info({
      title: t("Shift Tasks"),
      content: shift.notes,
      onOk() {},
    });
  };

  return (
    <React.Fragment>
      <List.Item
        css={{
          backgroundColor: Colors.MainOnWhite,
          padding: 5,
          margin: 5,
        }}
        actions={[
          <Button
            key="notes"
            disabled={!shift?.notes}
            onClick={showNotes}
            icon={<Icon component={Note} />}
            type="link"
            shape="circle"
          />,
          <Button
            key="tasks"
            disabled={Object.keys(shift?.tasks ?? {}).length <= 0}
            onClick={() => setTasksDialogOpen(true)}
            icon={<OrderedListOutlined />}
            type="link"
            shape="circle"
          />,
        ]}
      >
        <List.Item.Meta
          title={`${shift.getStartDayjsDate.format(
            "h:mm a"
          )} - ${shift.getEndDayjsDate.format("h:mm a")}`.toUpperCase()}
          description={getHours()}
        />

        {shift.position && (
          <Space css={{ display: "flex", justifyContent: "space-evenly" }}>
            {shift.position && <Tag color="processing">{shift.position}</Tag>}
          </Space>
        )}
      </List.Item>
      <Modal
        open={tasksDialogOpen}
        title={t("Shift Tasks")}
        closable={false}
        cancelButtonProps={{ style: { display: "none" } }}
        okText={t("Accept")}
        onOk={handleSaveTasks}
      >
        <SimpleTodo tasks={shift?.tasks} onChange={handleTaskChange} />
      </Modal>
    </React.Fragment>
  );
}

export default ShiftCard;
