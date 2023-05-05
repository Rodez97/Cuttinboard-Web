/** @jsx jsx */
import { jsx } from "@emotion/react";
import TasksMain from "./TasksMain";
import {
  ChecklistProvider,
  RecurringTasksProvider,
} from "@cuttinboard-solutions/cuttinboard-library";
import usePageTitle from "../../hooks/usePageTitle";

export default function Tasks() {
  usePageTitle("Shift Tasks");

  return (
    <ChecklistProvider checklistDocument="locationChecklists">
      <RecurringTasksProvider>
        <TasksMain />
      </RecurringTasksProvider>
    </ChecklistProvider>
  );
}
