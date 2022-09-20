import { useLocation } from "@cuttinboard/cuttinboard-library/services";
import React, { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import AppsView from "./AppsView";

const Tasks = lazy(() => import("./Tasks/Tasks"));
const Notes = lazy(() => import("./Notes/Notes"));
const Shifts = lazy(() => import("./MyShifts/MyShifts"));
const Storage = lazy(() => import("./Files/Files"));
const GlobalChecklist = lazy(() => import("./GlobalChecklist/GlobalChecklist"));

const Employees = lazy(() => import("../Admin/Employees/EmployeesRouter"));
const Schedule = lazy(() => import("../Admin/Scheduler/Schedule"));
const Utensils = lazy(() => import("../Admin/Utensils/Utensils"));

function AppsRouter() {
  const { locationAccessKey } = useLocation();
  return (
    <Routes>
      <Route path="/">
        <Route index element={<AppsView />} />
        <Route
          path={`to-do/*`}
          element={
            <Suspense fallback={<>...</>}>
              <Tasks />
            </Suspense>
          }
        />
        <Route
          path={`notes/*`}
          element={
            <Suspense fallback={<>...</>}>
              <Notes />
            </Suspense>
          }
        />
        <Route
          path={`my-shifts/*`}
          element={
            <Suspense fallback={<>...</>}>
              <Shifts />
            </Suspense>
          }
        />
        <Route
          path={`storage/*`}
          element={
            <Suspense fallback={<>...</>}>
              <Storage />
            </Suspense>
          }
        />
        <Route
          path={`lochecklist/*`}
          element={
            <Suspense fallback={<>...</>}>
              <GlobalChecklist />
            </Suspense>
          }
        />
        {locationAccessKey.role <= 3 && [
          <Route
            key="emp"
            path={`employees/*`}
            element={
              <Suspense fallback={<>...</>}>
                <Employees />
              </Suspense>
            }
          />,
          <Route
            key="sch"
            path={`schedule/*`}
            element={
              <Suspense fallback={<>...</>}>
                <Schedule />
              </Suspense>
            }
          />,
          <Route
            key="uts"
            path={`utensils/*`}
            element={
              <Suspense fallback={<>...</>}>
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
