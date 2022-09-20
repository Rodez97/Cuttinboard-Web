import { useCuttinboard } from "@cuttinboard/cuttinboard-library/services";
import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import VerifyEmail from "../Auth/VerifyEmail";
import PageLoading from "../components/PageLoading";
import { useDashboard } from "./DashboardProvider";
import UpgradeAccount from "./UpgradeAccount";

const Locations = lazy(() => import("./Locations/Locations"));
const Account = lazy(() => import("./Account/Account"));
const MyDocuments = lazy(() => import("./MyDocuments"));
const Subscription = lazy(() => import("./Subscription"));
const OwnerPortal = lazy(() => import("./OwnerPortal/OwnerPortal"));

function DashboardRouter() {
  const { userDocument } = useDashboard();
  const { user } = useCuttinboard();
  return (
    <Routes>
      <Route path="/">
        <Route
          path="locations/*"
          element={
            <Suspense fallback={<PageLoading />}>
              <Locations />
            </Suspense>
          }
        />
        <Route
          path="owner-portal/*"
          element={
            <Suspense fallback={<PageLoading />}>
              <OwnerPortal />
            </Suspense>
          }
        />

        <Route
          path="account"
          element={
            <Suspense fallback={<PageLoading />}>
              <Account />
            </Suspense>
          }
        />
        <Route
          path="my-documents"
          element={
            <Suspense fallback={<PageLoading />}>
              <MyDocuments />
            </Suspense>
          }
        />
        {userDocument.subscriptionId && (
          <Route
            path="subscription"
            element={
              <Suspense fallback={<PageLoading />}>
                <Subscription />
              </Suspense>
            }
          />
        )}

        {!userDocument?.subscriptionId && (
          <Route
            path="upgrade"
            element={user.emailVerified ? <UpgradeAccount /> : <VerifyEmail />}
          />
        )}

        <Route
          index
          element={
            <Navigate
              to={userDocument.subscriptionId ? "owner-portal" : "locations"}
            />
          }
        />
        <Route
          path="*"
          element={
            <Navigate
              to={userDocument.subscriptionId ? "owner-portal" : "locations"}
            />
          }
        />
      </Route>
    </Routes>
  );
}

export default DashboardRouter;
