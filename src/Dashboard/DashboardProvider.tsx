import {
  Auth,
  Firestore,
} from "@cuttinboard-solutions/cuttinboard-library/firebase";
import {
  CuttinboardUser,
  Organization,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { doc, DocumentData, DocumentReference } from "firebase/firestore";
import React, { createContext, ReactNode, useContext } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { PageError, PageLoading } from "../components";

interface DashboardContextProps {
  userDocument: CuttinboardUser;
  subscriptionDocument: DocumentData;
  organization: Organization;
}

const DashboardContext = createContext<DashboardContextProps>(
  {} as DashboardContextProps
);

function DashboardProvider({ children }: { children: ReactNode }) {
  const [userDocument, loadingUserDocument, userDocumentError] =
    useDocumentData<CuttinboardUser>(
      doc(Firestore, "Users", Auth.currentUser.uid).withConverter(
        CuttinboardUser.Converter
      )
    );
  const [subscriptionDocument, loadingSubscriptionDocument, SubDocumentError] =
    useDocumentData(
      doc(
        Firestore,
        "Users",
        Auth.currentUser.uid,
        "subscription",
        "subscriptionDetails"
      )
    );
  const [organization, loadingOrganization, organizationError] =
    useDocumentData<Organization>(
      doc(
        Firestore,
        "Organizations",
        Auth.currentUser.uid
      ) as DocumentReference<Organization>
    );

  if (
    loadingUserDocument ||
    loadingSubscriptionDocument ||
    loadingOrganization
  ) {
    return <PageLoading />;
  }

  if (userDocumentError || SubDocumentError || organizationError) {
    return (
      <PageError
        error={userDocumentError ?? SubDocumentError ?? organizationError}
      />
    );
  }
  return (
    <DashboardContext.Provider
      value={{ userDocument, subscriptionDocument, organization }}
      key="DashboardContext"
    >
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);

export default DashboardProvider;
