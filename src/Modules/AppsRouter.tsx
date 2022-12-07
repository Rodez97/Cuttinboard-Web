import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import React, { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { PageLoading } from "../components";
import AppsView from "./AppsView";

const Tasks = lazy(() => import("./Tasks"));
const Notes = lazy(() => import("./Notes"));
const Shifts = lazy(() => import("./MyShifts"));
const Storage = lazy(() => import("./Files"));
const GlobalChecklist = lazy(() => import("./GlobalChecklist"));

const Employees = lazy(() => import("../Admin/Employees"));
const Schedule = lazy(() => import("../Admin/Scheduler"));
const Utensils = lazy(() => import("../Admin/Utensils"));

function AppsRouter() {
  const { locationAccessKey } = useCuttinboardLocation();
  return (
    <Routes>
      <Route path="/">
        <Route index element={<AppsView />} />
        <Route
          path={`to-do/*`}
          element={
            <Suspense fallback={<PageLoading />}>
              <Tasks />
            </Suspense>
          }
        />
        <Route
          path={`notes/*`}
          element={
            <Suspense fallback={<PageLoading />}>
              <Notes />
            </Suspense>
          }
        />
        <Route
          path={`my-shifts/*`}
          element={
            <Suspense fallback={<PageLoading />}>
              <Shifts />
            </Suspense>
          }
        />
        <Route
          path={`storage/*`}
          element={
            <Suspense fallback={<PageLoading />}>
              <Storage />
            </Suspense>
          }
        />
        <Route
          path={`lochecklist/*`}
          element={
            <Suspense fallback={<PageLoading />}>
              <GlobalChecklist />
            </Suspense>
          }
        />
        {locationAccessKey.role <= 3 && [
          <Route
            key="emp"
            path={`employees/*`}
            element={
              <Suspense fallback={<PageLoading />}>
                <Employees />
              </Suspense>
            }
          />,
          <Route
            key="sch"
            path={`schedule/*`}
            element={
              <Suspense fallback={<PageLoading />}>
                <Schedule />
              </Suspense>
            }
          />,
          <Route
            key="uts"
            path={`utensils/*`}
            element={
              <Suspense fallback={<PageLoading />}>
                <Utensils />
              </Suspense>
            }
          />,
        ]}
      </Route>
    </Routes>
  );
}

export default AppsRouter;
