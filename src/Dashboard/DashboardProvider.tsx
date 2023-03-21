import {
  ICuttinboardUser,
  Organization,
} from "@cuttinboard-solutions/types-helpers";
import { Result } from "antd";
import { DocumentData } from "firebase/firestore";
import React, { createContext, ReactNode, useContext } from "react";
import { LoadingPage } from "../shared";
import { useDashboardData } from "./useDashboardData";

interface DashboardContextProps {
  userDocument: ICuttinboardUser;
  subscriptionDocument: DocumentData | undefined;
  organization: Organization | undefined;
}

const DashboardContext = createContext<DashboardContextProps>(
  {} as DashboardContextProps
);

export default ({ children }: { children: ReactNode }) => {
  const [userDocument, subscriptionDocument, organization, loading] =
    useDashboardData();

  if (loading) {
    return <LoadingPage />;
  }

  if (!userDocument) {
    return <Result status="error" title="User not found" />;
  }

  return (
    <DashboardContext.Provider
      value={{ userDocument, subscriptionDocument, organization }}
      key="DashboardContext"
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
