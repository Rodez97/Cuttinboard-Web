/** @jsx jsx */
import { jsx } from "@emotion/react";
import Icon, { MinusOutlined } from "@ant-design/icons";
import { Button, Checkbox, Typography } from "antd";
import { useState } from "react";
import mdiDrag from "@mdi/svg/svg/drag.svg";
import { recordError } from "../../utils/utils";
import { reorder } from "../../utils/reorder";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { ITask } from "@cuttinboard-solutions/types-helpers";

interface SimpleTodoProps {
  tasks: ITask[];
  onChange: (task: ITask, newStatus: boolean) => void;
  canRemove?: boolean;
  onRemove?: (task: ITask) => void;
  onTaskNameChange?: (task: ITask, newName: string) => void;
  onReorder: (
    element: ITask,
    sourceIndex: number,
    targetIndex: number
  ) => void | Promise<void>;
}

function Tasklist({
  tasks,
  onChange,
  canRemove,
  onRemove,
  onTaskNameChange,
  onReorder,
}: SimpleTodoProps) {
  const [items, setItems] = useState<ITask[] | null>(null);

  async function onDragEnd(result: DropResult) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    const changedItems = reorder(
      tasks,
      result.source.index,
      result.destination.index
    );
    setItems(changedItems);

    const item = tasks[result.source.index];

    try {
      await onReorder(item, result.source.index, result.destination.index);
    } catch (error) {
      recordError(error);
    } finally {
      setItems(null);
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable-list-tasks">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {(items ?? tasks).map((task, index) => (
              <Draggable
                key={task.id + index}
                draggableId={task.id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    css={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <Icon
                      component={mdiDrag}
                      {...provided.dragHandleProps}
                      css={{
                        fontSize: 20,
                        marginRight: 10,
                        color: "#00000050",
                      }}
                    />
                    <div
                      css={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <div
                        css={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          gap: 10,
                        }}
                      >
                        <Checkbox
                          checked={task.status}
                          onChange={(e) => onChange(task, e.target.checked)}
                        />
                        <Typography.Paragraph
                          delete={task.status}
                          editable={
                            canRemove &&
                            onTaskNameChange && {
                              onChange: (newName) =>
                                onTaskNameChange(task, newName),
                            }
                          }
                          css={{
                            color: task.status ? "#00000050" : "#000000",
                            width: "100%",
                            margin: "0 !important",
                            padding: "0 !important",
                          }}
                        >
                          {task.name}
                        </Typography.Paragraph>
                      </div>

                      {canRemove && onRemove && (
                        <Button
                          key="delete"
                          onClick={() => onRemove(task)}
                          danger
                          type="link"
                          icon={<MinusOutlined />}
                        />
                      )}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default Tasklist;
