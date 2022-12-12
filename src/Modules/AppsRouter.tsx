import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import React, { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { LoadingPage } from "../shared";
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
            <Suspense fallback={<LoadingPage />}>
              <Tasks />
            </Suspense>
          }
        />
        <Route
          path={`notes/*`}
          element={
            <Suspense fallback={<LoadingPage />}>
              <Notes />
            </Suspense>
          }
        />
        <Route
          path={`my-shifts/*`}
          element={
            <Suspense fallback={<LoadingPage />}>
              <Shifts />
            </Suspense>
          }
        />
        <Route
          path={`storage/*`}
          element={
            <Suspense fallback={<LoadingPage />}>
              <Storage />
            </Suspense>
          }
        />
        <Route
          path={`lochecklist/*`}
          element={
            <Suspense fallback={<LoadingPage />}>
              <GlobalChecklist />
            </Suspense>
          }
        />
        {locationAccessKey.role <= 3 && [
          <Route
            key="emp"
            path={`employees/*`}
            element={
              <Suspense fallback={<LoadingPage />}>
                <Employees />
              </Suspense>
            }
          />,
          <Route
            key="sch"
            path={`schedule/*`}
            element={
              <Suspense fallback={<LoadingPage />}>
                <Schedule />
              </Suspense>
            }
          />,
          <Route
            key="uts"
            path={`utensils/*`}
            element={
              <Suspense fallback={<LoadingPage />}>
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
