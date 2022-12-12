/** @jsx jsx */
import { RecurringTask } from "@cuttinboard-solutions/cuttinboard-library/checklist";
import { jsx } from "@emotion/react";
import { Checkbox, Typography } from "antd";

export default ({
  task,
  onChange,
}: {
  task: RecurringTask;
  onChange: () => void;
}) => {
  return (
    <div
      css={{
        border: "1px dashed #00000050",
        marginBottom: 4,
        padding: 4,
      }}
    >
      <Checkbox onChange={onChange} checked={task.isCompleted}>
        <Typography.Text copyable delete={task.isCompleted}>
          {task.name}
        </Typography.Text>
      </Checkbox>
    </div>
  );
};
