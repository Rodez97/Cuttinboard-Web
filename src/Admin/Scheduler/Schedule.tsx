import { ScheduleProvider } from "@cuttinboard-solutions/cuttinboard-library/services";
import React from "react";
import PageError from "../../components/PageError";
import PageLoading from "../../components/PageLoading";
import Scheduler from "./Scheduler";

function Schedule() {
  return (
    <ScheduleProvider
      LoadingElement={<PageLoading />}
      ErrorElement={(error) => <PageError error={error} />}
    >
      <Scheduler />
    </ScheduleProvider>
  );
}

export default Schedule;
