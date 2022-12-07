import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { nanoid } from "nanoid";
import { useTranslation } from "react-i18next";
import SimpleTodo from "./SimpleTodo";
import { Input, InputRef } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import {
  Checklist,
  Task,
} from "@cuttinboard-solutions/cuttinboard-library/checklist";
import { recordError } from "../utils/utils";

interface QuickTodoProps {
  checklist: Checklist;
}

export interface QuickTodoRef {
  addTask: (name: string) => Promise<void>;
  removeTask: (task: Task) => Promise<void>;
}

const QuickTodo = forwardRef<QuickTodoRef, QuickTodoProps>(
  ({ checklist }, ref) => {
    const [newTaskName, setNewTaskName] = useState("");
    const { t } = useTranslation();
    const inputRef = useRef<InputRef>(null);

    const addTask = async (newName = newTaskName) => {
      if (newName) {
        try {
          checklist.addTask(nanoid(), newName);
        } catch (error) {
          recordError(error);
        } finally {
          setNewTaskName("");
        }
      }
      inputRef.current?.focus();
    };

    const handleTaskChange = (task: Task, newStatus: boolean) => async () => {
      try {
        await task.changeTaskStatus(newStatus);
      } catch (error) {
        recordError(error);
      }
    };

    const removeTask = async (task: Task) => {
      try {
        checklist.removeTask(task.id);
      } catch (error) {
        recordError(error);
      }
    };

    useImperativeHandle(ref, () => ({
      addTask,
      removeTask,
    }));

    return (
      <>
        <Input
          ref={inputRef}
          placeholder={t("Add a task")}
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          onKeyDown={(e) => {
            if (e.code === "Enter") {
              e.preventDefault();
              addTask();
            }
          }}
          addonAfter={<PlusCircleOutlined onClick={() => addTask()} />}
        />
        <SimpleTodo
          tasks={checklist.tasksArray}
          canRemove
          onRemove={removeTask}
          onChange={handleTaskChange}
        />
      </>
    );
  }
);

export default QuickTodo;
