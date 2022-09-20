import React from "react";
import { Route, Routes } from "react-router-dom";
import CreateEmployee from "./CreateEmployee";
import EmployeeProfile from "./EmployeeProfile";
import Employees from "./Employees";

function EmployeesRouter() {
  return (
    <Routes>
      <Route path="/create" element={<CreateEmployee />} />
      <Route path="/:id" element={<EmployeeProfile />} />
      <Route index element={<Employees />} />
    </Routes>
  );
}

export default EmployeesRouter;
