import React from "react";
import Scheduler from "./Scheduler";
import { Route, Routes } from "react-router-dom";
import RosterView from "./RosterView";
import { ScheduleProvider } from "@cuttinboard-solutions/cuttinboard-library/schedule";
import { PageError, PageLoading } from "../../components";

export default () => {
  return (
    <ScheduleProvider
      ErrorRenderer={(err) => <PageError error={err} />}
      LoadingRenderer={PageLoading}
    >
      <Routes>
        <Route path="/" element={<Scheduler />} />
        <Route path="roster" element={<RosterView />} />
      </Routes>
    </ScheduleProvider>
  );
};
