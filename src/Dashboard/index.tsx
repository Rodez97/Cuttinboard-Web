import React from "react";
import Dashboard from "./Dashboard";
import DashboardProvider from "./DashboardProvider";

function index() {
  return (
    <DashboardProvider>
      <Dashboard />
    </DashboardProvider>
  );
}

export default index;
