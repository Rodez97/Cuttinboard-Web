import {
  FIRESTORE,
  orgEmployeeConverter,
  useCuttinboard,
} from "@rodez97/cuttinboard-library";
import { RoleAccessLevels } from "@rodez97/types-helpers";
import { collection, query, where } from "firebase/firestore";
import React, { lazy, Suspense } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Route, Routes } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import { PageError, LoadingPage } from "../../shared";

const Supervisors = lazy(() => import("./Supervisors"));
const SupervisorDetails = lazy(() => import("./SupervisorDetails"));
const NewSupervisor = lazy(() => import("./NewSupervisor"));

export default () => {
  usePageTitle("Supervisors");
  const { user } = useCuttinboard();
  const [supervisors, loading, error] = useCollectionData(
    query(
      collection(FIRESTORE, "Organizations", user.uid, "employees"),
      where("role", "==", RoleAccessLevels.ADMIN)
    ).withConverter(orgEmployeeConverter)
  );

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <PageError error={error} />;
  }

  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>
        <Route
          path="/"
          element={<Supervisors supervisors={supervisors ?? []} />}
        />
        <Route
          path="new-supervisor"
          element={<NewSupervisor supervisors={supervisors ?? []} />}
        />
        <Route
          path="details/:supervisorId/*"
          element={<SupervisorDetails supervisors={supervisors ?? []} />}
        />
      </Routes>
    </Suspense>
  );
};
