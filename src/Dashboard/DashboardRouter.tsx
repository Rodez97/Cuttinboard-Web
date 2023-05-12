import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoadingPage } from "../shared";
import { useDashboard } from "./DashboardProvider";

const Locations = lazy(() => import("./Locations"));
const Account = lazy(() => import("./Account/Account"));
const MyDocuments = lazy(() => import("./Account/MyDocuments"));
const Subscription = lazy(() => import("./Subscription"));
const OwnerPortal = lazy(() => import("./OwnerPortal"));
const DirectMessages = lazy(() => import("../Chats/DirectMessages"));
const Conversations = lazy(() => import("../Chats/Conversations"));
const GNotes = lazy(() => import("./GNotes"));
const GFiles = lazy(() => import("./GFiles"));
const AddFirstLocation = lazy(() => import("./UpgradeCreate/AddFirstLocation"));
const MyShifts = lazy(() => import("../Modules/MyShifts"));

function DashboardRouter() {
  const { userDocument, organization } = useDashboard();

  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>
        <Route path="/">
          <Route path="locations/*" element={<Locations />} />

          <Route path="owner-portal/*" element={<OwnerPortal />} />

          {Boolean(organization?.hadMultipleLocations) && (
            <Route path="global-notes/*" element={<GNotes />} />
          )}

          {Boolean(organization?.hadMultipleLocations) && (
            <Route path="global-files/*" element={<GFiles />} />
          )}

          <Route path="directMessages/*" element={<DirectMessages />} />
          <Route path="conversations/*" element={<Conversations />} />
          <Route path="my-shifts" element={<MyShifts />} />
          <Route path="account" element={<Account />} />
          <Route path="my-documents" element={<MyDocuments />} />
          {userDocument.subscriptionId && (
            <Route path="subscription" element={<Subscription />} />
          )}

          {!userDocument?.subscriptionId && (
            <Route path="upgrade-create" element={<AddFirstLocation />} />
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
    </Suspense>
  );
}

export default DashboardRouter;
