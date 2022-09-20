import { Todo_Task } from "@cuttinboard/cuttinboard-library";
import { Timestamp } from "@firebase/firestore";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { nanoid } from "nanoid";
import { useTranslation } from "react-i18next";
import SimpleTodo from "./SimpleTodo";
import { Input } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";

interface QuickTodoProps {
  tasks: Record<string, Todo_Task>;
  onChange: (tasks: Record<string, Todo_Task>) => void;
}

export interface QuickTodoRef {
  addTask: () => void;
  removeTask: (key: string) => void;
}

const QuickTodo = forwardRef<QuickTodoRef, QuickTodoProps>(
  ({ tasks, onChange }, ref) => {
    const [newTaskName, setNewTaskName] = useState("");
    const { t } = useTranslation();

    const addTask = () => {
      if (newTaskName) {
        onChange({
          ...tasks,
          [nanoid()]: {
            name: newTaskName,
            status: false,
            createdAt: Timestamp.now(),
          },
        });
        setNewTaskName("");
      }
    };

    const handleTaskChange = (key: string, status: boolean) => () => {
      onChange({ ...tasks, [key]: { ...tasks[key], status } });
    };

    const removeTask = (key: string) => {
      const { [key]: remove, ...others } = tasks;
      onChange(others);
    };

    useImperativeHandle(ref, () => ({
      addTask,
      removeTask,
    }));

    return (
      <>
        <Input
          placeholder={t("Add a task")}
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          onKeyDown={(e) => {
            if (e.code === "Enter") {
              e.preventDefault();
              addTask();
            }
          }}
          addonAfter={<PlusCircleOutlined onClick={addTask} />}
        />
        <SimpleTodo
          tasks={tasks}
          canRemove
          onRemove={removeTask}
          onChange={handleTaskChange}
        />
      </>
    );
  }
);

export default QuickTodo;
