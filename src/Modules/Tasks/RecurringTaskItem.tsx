/** @jsx jsx */
import { RecurringTask } from "@cuttinboard-solutions/cuttinboard-library/checklist";
import { jsx } from "@emotion/react";
import { Typography } from "antd";
import { DragSourceMonitor, useDrag } from "react-dnd";

export default ({ id, task }: { id: string; task: RecurringTask }) => {
  const [{ opacity, cursor }, drag] = useDrag(
    () => ({
      type: "recurringTask",
      item: { id, task },
      collect: (monitor: DragSourceMonitor) => ({
        opacity: monitor.isDragging() ? 0.4 : 1,
        cursor: monitor.isDragging() ? "grabbing" : "grab",
      }),
    }),
    [id, task]
  );

  return (
    <div
      ref={drag}
      css={{
        opacity,
        border: "1px dashed #00000050",
        marginBottom: 4,
        cursor,
        padding: 4,
      }}
    >
      <Typography.Text copyable>{task.name}</Typography.Text>
    </div>
  );
};
