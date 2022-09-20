import { setDoc } from "@firebase/firestore";
import React, { useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { useTranslation } from "react-i18next";
import SimpleTodo from "../../components/SimpleTodo";
import { Shift, Todo_Task } from "@cuttinboard/cuttinboard-library/models";
import { getShiftDate } from "@cuttinboard/cuttinboard-library/services";
import { Button, List, Modal, Space, Tag } from "antd";
import { Colors } from "@cuttinboard/cuttinboard-library/utils";
import Icon, { OrderedListOutlined, RetweetOutlined } from "@ant-design/icons";
import { Note } from "../Notes/notesIcons";
import { recordError } from "../../utils/utils";
dayjs.extend(advancedFormat);
dayjs.extend(duration);

interface ShiftCardProps {
  shift: Shift;
}

function ShiftCard({ shift }: ShiftCardProps) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [tasksDialogOpen, setTasksDialogOpen] = useState(false);
  const [tasks, setTasks] = useState(shift?.tasks ?? {});

  const handleTaskChange = (taskId: string, newStatus: boolean) => {
    setTasks(
      (tsk) =>
        ({ ...tsk, [taskId]: { ...tsk[taskId], status: newStatus } } as Record<
          string,
          Todo_Task
        >)
    );
  };

  const handleSaveTasks = async () => {
    setSaving(true);
    try {
      await setDoc(shift.docRef, { tasks }, { merge: true });
    } catch (error) {
      recordError(error);
    }
    setTasksDialogOpen(false);
    setSaving(false);
  };

  const getHours = () => {
    const start = getShiftDate(shift.start);
    const end = getShiftDate(shift.end);
    const duration = end.diff(start);
    return dayjs
      .duration(duration)
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
    <>
      <List.Item
        style={{
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
            disabled={Object.keys(tasks).length <= 0}
            onClick={() => setTasksDialogOpen(true)}
            icon={<OrderedListOutlined />}
            type="link"
            shape="circle"
          />,
        ]}
      >
        <List.Item.Meta
          title={`${getShiftDate(shift.start).format(
            "h:mm a"
          )} - ${getShiftDate(shift.end).format("h:mm a")}`.toUpperCase()}
          description={getHours()}
        />

        {(shift.position || shift.altId === "repeat") && (
          <Space style={{ display: "flex", justifyContent: "space-evenly" }}>
            {shift.position && <Tag color="processing">{shift.position}</Tag>}
            {shift.altId === "repeat" && <RetweetOutlined />}
          </Space>
        )}
      </List.Item>
      <Modal
        open={tasksDialogOpen}
        title={t("Shift Tasks")}
        closable={false}
        confirmLoading={saving}
        cancelButtonProps={{ style: { display: "none" } }}
        okText={t("Accept")}
        onOk={handleSaveTasks}
      >
        <SimpleTodo tasks={tasks} onChange={handleTaskChange} />
      </Modal>
    </>
  );
}

export default ShiftCard;
