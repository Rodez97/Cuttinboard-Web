/** @jsx jsx */
import {
  IRecurringTask,
  recurringTaskIsCompleted,
} from "@rodez97/types-helpers";
import { jsx } from "@emotion/react";
import { Checkbox, Typography } from "antd/es";
import { useMemo } from "react";

export default ({
  task,
  onChange,
}: {
  task: IRecurringTask;
  onChange: () => void;
}) => {
  const isCompleted = useMemo(() => recurringTaskIsCompleted(task), [task]);

  return (
    <div
      css={{
        marginBottom: 4,
        padding: 4,
      }}
    >
      <Checkbox onChange={onChange} checked={isCompleted}>
        <Typography.Text copyable delete={isCompleted}>
          {task.name}
        </Typography.Text>
      </Checkbox>
    </div>
  );
};
