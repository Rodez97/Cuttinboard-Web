import React from "react";
import { Route, Routes } from "react-router-dom";
import EmployeeProfile from "./EmployeeProfile";
import Employees from "./Employees";

function EmployeesRouter() {
  return (
    <Routes>
      <Route path="/:id" element={<EmployeeProfile />} />
      <Route index element={<Employees />} />
    </Routes>
  );
}

export default EmployeesRouter;
