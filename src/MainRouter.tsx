/** @jsx jsx */
import { jsx } from "@emotion/react";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoadingPage } from "./shared";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library";
import InitialForm from "./Dashboard/InitialForm/InitialForm";
import useSignUpLocalTracker from "./hooks/useSignUpLocalTracker";

const Dashboard = lazy(
  () => import(/* webpackChunkName: "dashboard" */ "./Dashboard")
);
const LocationRoutes = lazy(
  () => import(/* webpackChunkName: "location-routes" */ "./LocationRoutes")
);

function MainRouter() {
  const { organizationKey, user } = useCuttinboard();
  const [newUser] = useSignUpLocalTracker();

  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>
        <Route path="/">
          {organizationKey ? (
            <Route
              index
              element={
                <Navigate
                  to={`l/${organizationKey.orgId}/${organizationKey.locId}`}
                />
              }
            />
          ) : (
            <Route index element={<Navigate to="dashboard" />} />
          )}

          <Route
            path="dashboard/*"
            element={
              newUser && newUser === user.email ? (
                <InitialForm />
              ) : (
                <Dashboard />
              )
            }
          />
          <Route
            path="l/:organizationId/:locationId/*"
            element={<LocationRoutes />}
          />
          <Route path="*" element={<Navigate to="dashboard" />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default MainRouter;
