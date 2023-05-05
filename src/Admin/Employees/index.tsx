import React from "react";
import { Route, Routes } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import EmployeeDocuments from "./EmployeeDocuments";
import Employees from "./Employees";
import EmpSettings from "./EmpSettings";
import { useLocationPermissions } from "@cuttinboard-solutions/cuttinboard-library";

export default function EmployeesRoot() {
  usePageTitle("Employees");
  const checkPermission = useLocationPermissions();
  return (
    <Routes>
      <Route path="/s/:id" element={<EmpSettings />} />
      {checkPermission("manageStaffDocuments") && (
        <Route path="/d/:id" element={<EmployeeDocuments />} />
      )}
      <Route index element={<Employees />} />
    </Routes>
  );
}
