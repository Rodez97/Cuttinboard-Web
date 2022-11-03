/** @jsx jsx */
import { jsx } from "@emotion/react";
import { LoadingScreen } from "./components/LoadingScreen";
import PageLoading from "./components/PageLoading";
import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import useSelectedLocation from "./hooks/useSelectedLocation";
import { LocationContainer } from "./LocationContainer";
import PageError from "./components/PageError";
import { FirebaseError } from "firebase/app";
import { recordError } from "./utils/utils";
import {
  EmployeesProvider,
  LocationProvider,
  useCuttinboard,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { CuttinboardError } from "@cuttinboard-solutions/cuttinboard-library/models";
import DashboardProvider from "./Dashboard/DashboardProvider";
import { Layout } from "antd";
import runOneSignal from "runOneSignal";
import OneSignal from "react-onesignal";
import { Auth } from "@cuttinboard-solutions/cuttinboard-library/firebase";
const Dashboard = lazy(() => import("./Dashboard/Dashboard"));

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
              element={<Navigate to={`location/${selectedLocation}`} />}
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
            path="location/:locationId/*"
            element={
              <LocationProvider
                organizationKey={organizationKey}
                locationId={selectedLocation}
              >
                {({ loading, error }) =>
                  loading ? (
                    <LoadingScreen />
                  ) : error ? (
                    <PageError error={error} />
                  ) : (
                    <EmployeesProvider>
                      <LocationContainer />
                    </EmployeesProvider>
                  )
                }
              </LocationProvider>
            }
          />
          <Route path="*" element={<Navigate to="dashboard" />} />
        </Route>
      </Routes>
    </Layout>
  );
}

export default MainRouter;
