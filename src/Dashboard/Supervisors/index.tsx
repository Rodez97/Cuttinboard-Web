import { Employee } from "@cuttinboard-solutions/cuttinboard-library/employee";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  FIRESTORE,
  RoleAccessLevels,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { collection, query, where } from "firebase/firestore";
import React from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Route, Routes } from "react-router-dom";
import { PageError, LoadingPage } from "../../shared";
import NewSupervisor from "./NewSupervisor";
import SupervisorDetails from "./SupervisorDetails";
import Supervisors from "./Supervisors";

export default () => {
  const { user } = useCuttinboard();
  const [supervisors, loading, error] = useCollectionData(
    query(
      collection(FIRESTORE, "Organizations", user.uid, "employees"),
      where("role", "==", RoleAccessLevels.ADMIN)
    ).withConverter(Employee.firestoreConverter)
  );

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <PageError error={error} />;
  }

  return (
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
  );
};
