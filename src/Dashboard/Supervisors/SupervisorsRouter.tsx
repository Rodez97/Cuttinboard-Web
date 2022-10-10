import {
  Auth,
  Firestore,
} from "@cuttinboard-solutions/cuttinboard-library/firebase";
import {
  Employee,
  ModuleFirestoreConverter,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { RoleAccessLevels } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { collection, query, where } from "firebase/firestore";
import React from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Route, Routes } from "react-router-dom";
import PageError from "../../components/PageError";
import PageLoading from "../../components/PageLoading";
import NewSupervisor from "./NewSupervisor";
import SupervisorDetails from "./SupervisorDetails";
import Supervisors from "./Supervisors";

function SupervisorsRouter() {
  const [supervisors, loading, error] = useCollectionData(
    query(
      collection(Firestore, "Organizations", Auth.currentUser.uid, "employees"),
      where("role", "==", RoleAccessLevels.ADMIN)
    ).withConverter(Employee.Converter)
  );

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError error={error} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Supervisors supervisors={supervisors} />} />
      <Route path="new-supervisor" element={<NewSupervisor />} />
      <Route
        path="details/:supervisorId/*"
        element={<SupervisorDetails supervisors={supervisors} />}
      />
    </Routes>
  );
}

export default SupervisorsRouter;
