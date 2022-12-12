/** @jsx jsx */
import { jsx } from "@emotion/react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import DashboardProvider from "./Dashboard/DashboardProvider";
import runOneSignal from "runOneSignal";
import OneSignal from "react-onesignal";
import { useSelectedLocation } from "./hooks";
import { isEmpty } from "lodash";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library/services";
import { LoadingPage } from "./shared";

const Dashboard = lazy(() => import("./Dashboard/Dashboard"));
const LocationRoutes = lazy(() => import("./LocationRoutes"));

function MainRouter() {
  const { organizationKey, user } = useCuttinboard();
  const { selectedLocation } = useSelectedLocation();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      runOneSignal().then(() => {
        OneSignal.setExternalUserId(user.uid);
      });
    }
  }, [initialized, user.uid]);

  const isLocationSelected = useMemo(() => {
    return !isEmpty(organizationKey) && selectedLocation;
  }, [organizationKey, selectedLocation]);

  return (
    <Routes>
      <Route path="/">
        {isLocationSelected && organizationKey ? (
          <Route
            index
            element={
              <Navigate to={`l/${organizationKey.orgId}/${selectedLocation}`} />
            }
          />
        ) : (
          <Route index element={<Navigate to="dashboard" />} />
        )}

        <Route
          path="dashboard/*"
          element={
            <Suspense fallback={<LoadingPage />}>
              <DashboardProvider>
                <Dashboard />
              </DashboardProvider>
            </Suspense>
          }
        />
        <Route
          path="l/:organizationId/:locationId/*"
          element={
            <Suspense fallback={<LoadingPage />}>
              <LocationRoutes />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="dashboard" />} />
      </Route>
    </Routes>
  );
}

export default MainRouter;
