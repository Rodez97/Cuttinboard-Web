import { DeleteOutlined } from "@ant-design/icons";
import { Todo_Task } from "@cuttinboard-solutions/cuttinboard-library";
import { Button, Checkbox, List, Typography } from "antd";
import React from "react";
import { getOrderedTasks } from "../utils/utils";

interface SimpleTodoProps {
  tasks: Record<string, Todo_Task>;
  onChange: (taskId: string, newStatus: boolean) => void;
  canRemove?: boolean;
  onRemove?: (taskId: string) => void;
}

function SimpleTodo({ tasks, onChange, canRemove, onRemove }: SimpleTodoProps) {
  return (
    <List
      dataSource={getOrderedTasks(tasks)}
      renderItem={([id, task]) => {
        return (
          <List.Item
            key={id}
            actions={
              canRemove && [
                <Button
                  key="delete"
                  onClick={() => onRemove(id)}
                  danger
                  type="link"
                  icon={<DeleteOutlined />}
                />,
              ]
            }
          >
            <List.Item.Meta
              avatar={
                <Checkbox
                  checked={task.status}
                  onChange={(e) => onChange(id, e.target.checked)}
                />
              }
              title={
                <Typography.Text delete={task.status}>
                  {task.name}
                </Typography.Text>
              }
            />
          </List.Item>
        );
      }}
    />
  );
}

export default SimpleTodo;
