import { LoadingScreen } from "./components/LoadingScreen";
import PageLoading from "./components/PageLoading";
import React, { lazy, Suspense, useMemo } from "react";
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

const Dashboard = lazy(() => import("./Dashboard/Dashboard"));

function MainRouter() {
  const { organizationKey } = useCuttinboard();
  const { selectedLocation } = useSelectedLocation();

  const isLocationSelected = useMemo(() => {
    return organizationKey !== null && selectedLocation !== null;
  }, [organizationKey, selectedLocation]);

  const onError = (error: FirebaseError | CuttinboardError) => {
    recordError(error);

    if (error?.code && error.code === "UNDEFINED_LOCATION") {
      return <Navigate to="dashboard" />;
    }
    return <PageError error={error} />;
  };

  return (
    <Layout>
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
                LoadingElement={<LoadingScreen />}
                organizationKey={organizationKey}
                locationId={selectedLocation}
                ErrorElement={onError}
              >
                <EmployeesProvider>
                  <LocationContainer />
                </EmployeesProvider>
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
