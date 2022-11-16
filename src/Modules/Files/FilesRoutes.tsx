import { useCuttinboardModule } from "@cuttinboard-solutions/cuttinboard-library/services";
import React, { useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { NotFound } from "../../components/NotFound";
import FilesMain from "./FilesMain";

function FilesRoutes() {
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

  return <FilesMain />;
}

export default FilesRoutes;
