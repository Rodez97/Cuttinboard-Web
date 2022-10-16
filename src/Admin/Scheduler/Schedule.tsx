import { ScheduleProvider } from "@cuttinboard-solutions/cuttinboard-library/services";
import React from "react";
import { recordError } from "utils/utils";
import PageError from "../../components/PageError";
import PageLoading from "../../components/PageLoading";
import Scheduler from "./Scheduler";

function Schedule() {
  return (
    <ScheduleProvider onError={recordError}>
      {({ loading, error }) =>
        loading ? (
          <PageLoading />
        ) : error ? (
          <PageError error={error} />
        ) : (
          <Scheduler />
        )
      }
    </ScheduleProvider>
  );
}

export default Schedule;
