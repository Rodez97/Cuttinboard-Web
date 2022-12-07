import { MinusOutlined } from "@ant-design/icons";
import { Task } from "@cuttinboard-solutions/cuttinboard-library/checklist";
import { Button, Checkbox, List, Typography } from "antd";
import React from "react";

interface SimpleTodoProps {
  tasks: Task[];
  onChange: (task: Task, newStatus: boolean) => void;
  canRemove?: boolean;
  onRemove?: (task: Task) => void;
  onTaskNameChange?: (task: Task, newName: string) => void;
}

function SimpleTodo({
  tasks,
  onChange,
  canRemove,
  onRemove,
  onTaskNameChange,
}: SimpleTodoProps) {
  return (
    <List
      dataSource={tasks}
      renderItem={(task) => {
        return (
          <List.Item
            key={task.id}
            actions={
              canRemove && onRemove
                ? [
                    <Button
                      key="delete"
                      onClick={() => onRemove(task)}
                      danger
                      type="link"
                      icon={<MinusOutlined />}
                    />,
                  ]
                : []
            }
          >
            <List.Item.Meta
              avatar={
                <Checkbox
                  checked={task.status}
                  onChange={(e) => onChange(task, e.target.checked)}
                />
              }
              title={
                <Typography.Text
                  delete={task.status}
                  editable={
                    canRemove &&
                    onTaskNameChange && {
                      onChange: (newName) => onTaskNameChange(task, newName),
                    }
                  }
                >
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
