import { PageLoading } from "@ant-design/pro-layout";
import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const FirebaseLogin = lazy(() => import("./FirebaseLogin"));
const FirebaseRecover = lazy(() => import("./FirebaseRecover"));
const FirebaseRegister = lazy(() => import("./FirebaseRegister"));

export default () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/">
          <Route path="login" element={<FirebaseLogin />} />
          <Route path="register" element={<FirebaseRegister />} />
          <Route path="forgot-password" element={<FirebaseRecover />} />
          <Route index element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
