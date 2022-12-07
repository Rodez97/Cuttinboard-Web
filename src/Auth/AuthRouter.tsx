import { AUTH } from "@cuttinboard-solutions/cuttinboard-library/utils";
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import FirebaseLogin from "./FirebaseLogin";
import FirebaseRecover from "./FirebaseRecover";
import FirebaseRegister from "./FirebaseRegister";

export default () => {
  if (AUTH.currentUser) {
    return <Navigate to="/dashboard" />;
  }
  return (
    <Routes>
      <Route path="/">
        <Route path="login" element={<FirebaseLogin />} />
        <Route path="register" element={<FirebaseRegister />} />
        <Route path="forgot-password" element={<FirebaseRecover />} />
        <Route index element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Route>
    </Routes>
  );
};
