/** @jsx jsx */
import React, { Suspense, useState } from "react";
import { jsx } from "@emotion/react";
import mdiDrag from "@mdi/svg/svg/drag.svg";
import Icon from "@ant-design/icons";
import { recordError } from "../../utils/utils";
import { reorder } from "../../utils/reorder";
import { lazily } from "react-lazily";
import type { DropResult } from "react-beautiful-dnd";

const { DragDropContext, Droppable, Draggable } = lazily(
  () => import("react-beautiful-dnd")
);

function DraggableList<T extends { id: string }>({
  dataSource,
  renderItem,
  onReorder,
}: {
  dataSource: T[];
  renderItem: (
    element: T,
    index: number,
    isDragging: boolean
  ) => React.ReactNode;
  onReorder: (
    element: T,
    sourceIndex: number,
    targetIndex: number
  ) => void | Promise<void>;
}) {
  const [items, setItems] = useState<T[] | null>(null);

  async function onDragEnd(result: DropResult) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    const changedItems = reorder(
      dataSource,
      result.source.index,
      result.destination.index
    );
    setItems(changedItems);

    const item = dataSource[result.source.index];

    try {
      await onReorder(item, result.source.index, result.destination.index);
    } catch (error) {
      recordError(error);
    } finally {
      setItems(null);
    }
  }

  return (
    <Suspense fallback={null}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable-list">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {(items ?? dataSource).map((item, index) => (
                <Draggable
                  key={item.id + index}
                  draggableId={item.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      css={{
                        display: "flex",
                        alignItems: "baseline",
                      }}
                    >
                      <Icon
                        component={mdiDrag}
                        {...provided.dragHandleProps}
                        css={{ fontSize: 30, marginRight: 10 }}
                      />
                      {renderItem(item, index, snapshot.isDragging)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Suspense>
  );
}

export default DraggableList;
