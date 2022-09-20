import { Auth, Firestore } from "@cuttinboard/cuttinboard-library/firebase";
import { Organization } from "@cuttinboard/cuttinboard-library/models";
import { doc, DocumentData, DocumentReference } from "firebase/firestore";
import React, { createContext, ReactNode, useContext } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import PageError from "../components/PageError";
import PageLoading from "../components/PageLoading";

interface DashboardContextProps {
  userDocument: DocumentData;
  subscriptionDocument: DocumentData;
  organization: Organization;
}

const DashboardContext = createContext<DashboardContextProps>(
  {} as DashboardContextProps
);

function DashboardProvider({ children }: { children: ReactNode }) {
  const [userDocument, loadingUserDocument, userDocumentError] =
    useDocumentData(doc(Firestore, "Users", Auth.currentUser.uid));
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
    >
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);

export default DashboardProvider;
