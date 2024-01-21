import { ChecklistProvider } from "@rodez97/cuttinboard-library";
import React from "react";
import GlobalChecklistMain from "./GlobalChecklistMain";
import usePageTitle from "../../hooks/usePageTitle";

function GlobalChecklist() {
  usePageTitle("Daily Checklists");

  return (
    <ChecklistProvider checklistDocument="dailyChecklists">
      <GlobalChecklistMain />
    </ChecklistProvider>
  );
}

export default GlobalChecklist;
