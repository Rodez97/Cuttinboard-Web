import { CuttinboardUser } from "@cuttinboard-solutions/cuttinboard-library/account";
import { Organization } from "@cuttinboard-solutions/cuttinboard-library/models";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library/services";
import { FIRESTORE } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Result } from "antd";
import { doc, DocumentData, DocumentReference } from "firebase/firestore";
import React, { createContext, ReactNode, useContext } from "react";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { PageError, PageLoading } from "../components";

interface DashboardContextProps {
  userDocument: CuttinboardUser;
  subscriptionDocument: DocumentData | undefined;
  organization: Organization | undefined;
}

const DashboardContext = createContext<DashboardContextProps>(
  {} as DashboardContextProps
);

export default ({ children }: { children: ReactNode }) => {
  const { user } = useCuttinboard();
  const [userDocument, loadingUserDocument, userDocumentError] =
    useDocumentData<CuttinboardUser>(
      doc(FIRESTORE, "Users", user.uid).withConverter(
        CuttinboardUser.firestoreConverter
      )
    );
  const [subscriptionDocument, loadingSubscriptionDocument, SubDocumentError] =
    useDocumentData(
      doc(FIRESTORE, "Users", user.uid, "subscription", "subscriptionDetails")
    );
  const [organization, loadingOrganization, organizationError] =
    useDocumentData<Organization>(
      doc(
        FIRESTORE,
        "Organizations",
        user.uid
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
        error={userDocumentError ?? SubDocumentError ?? organizationError!}
      />
    );
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
