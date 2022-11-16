import { useCuttinboardModule } from "@cuttinboard-solutions/cuttinboard-library/services";
import React, { useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { NotFound } from "../../components/NotFound";
import TasksMain from "./TasksMain";

function TasksRoutes() {
  const { boardId } = useParams();
  const { selectedApp, setSelected } = useCuttinboardModule();

  useLayoutEffect(() => {
    setSelected(boardId);
    return () => {
      setSelected(null);
    };
  }, [boardId]);

  if (!selectedApp) {
    return <NotFound />;
  }

  return <TasksMain />;
}

export default TasksRoutes;
