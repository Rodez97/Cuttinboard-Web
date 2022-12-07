import React from "react";
import { Route, Routes } from "react-router-dom";
import EmployeeDocuments from "./EmployeeDocuments";
import Employees from "./Employees";
import EmpSettings from "./EmpSettings";

export default () => {
  return (
    <Routes>
      <Route path="/s/:id" element={<EmpSettings />} />
      <Route path="/d/:id" element={<EmployeeDocuments />} />
      <Route index element={<Employees />} />
    </Routes>
  );
};
