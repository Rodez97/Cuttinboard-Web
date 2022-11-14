import { ScheduleProvider } from "@cuttinboard-solutions/cuttinboard-library/services";
import React from "react";
import { recordError } from "../../utils/utils";
import Scheduler from "./Scheduler";
import { Route, Routes } from "react-router-dom";
import RosterView from "./RosterView";

function Schedule() {
  return (
    <ScheduleProvider onError={recordError}>
      <Routes>
        <Route path="/" element={<Scheduler />} />
        <Route path="roster" element={<RosterView />} />
      </Routes>
    </ScheduleProvider>
  );
}

export default Schedule;
