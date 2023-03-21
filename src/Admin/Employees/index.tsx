import React from "react";
import { Route, Routes } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import EmployeeDocuments from "./EmployeeDocuments";
import Employees from "./Employees";
import EmpSettings from "./EmpSettings";

export default function EmployeesRoot() {
  usePageTitle("Employees");
  return (
    <Routes>
      <Route path="/s/:id" element={<EmpSettings />} />
      <Route path="/d/:id" element={<EmployeeDocuments />} />
      <Route index element={<Employees />} />
    </Routes>
  );
}
