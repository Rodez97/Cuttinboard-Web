/** @jsx jsx */
import { jsx } from "@emotion/react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library/services";
import DashboardProvider from "./Dashboard/DashboardProvider";
import { Layout } from "antd";
import runOneSignal from "runOneSignal";
import OneSignal from "react-onesignal";
import { Auth } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { useSelectedLocation } from "./hooks";
import { PageLoading } from "./components";

const Dashboard = lazy(() => import("./Dashboard/Dashboard"));
const LocationRoutes = lazy(() => import("./LocationRoutes"));

function MainRouter() {
  const { organizationKey } = useCuttinboard();
  const { selectedLocation } = useSelectedLocation();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      runOneSignal().then(() => {
        OneSignal.setExternalUserId(Auth.currentUser.uid);
      });
    }
  }, [initialized]);

  const isLocationSelected = useMemo(() => {
    return organizationKey !== null && selectedLocation !== null;
  }, [organizationKey, selectedLocation]);

  return (
    <Layout css={{ overflow: "auto" }}>
      <Routes>
        <Route path="/">
          {isLocationSelected ? (
            <Route
              index
              element={
                <Navigate
                  to={`l/${organizationKey.orgId}/${selectedLocation}`}
                />
              }
            />
          ) : (
            <Route index element={<Navigate to="dashboard" />} />
          )}

          <Route
            path="dashboard/*"
            element={
              <Suspense fallback={<PageLoading />}>
                <DashboardProvider>
                  <Dashboard />
                </DashboardProvider>
              </Suspense>
            }
          />
          <Route
            path="l/:organizationId/:locationId/*"
            element={
              <Suspense fallback={<PageLoading />}>
                <LocationRoutes />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="dashboard" />} />
        </Route>
      </Routes>
    </Layout>
  );
}

export default MainRouter;
