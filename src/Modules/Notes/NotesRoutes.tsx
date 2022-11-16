import { useCuttinboardModule } from "@cuttinboard-solutions/cuttinboard-library/services";
import React, { useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import NotesMain from "./NotesMain";
import { NotFound } from "../../components/NotFound";

function NotesRoutes() {
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
  return <NotesMain />;
}

export default NotesRoutes;
