import { ChecklistProvider } from "@cuttinboard-solutions/cuttinboard-library";
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
