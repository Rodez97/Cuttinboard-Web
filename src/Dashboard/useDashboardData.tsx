import { useEffect, useMemo, useState } from "react";
import { docData } from "rxfire/firestore";
import { combineLatest } from "rxjs";
import { doc, DocumentData, DocumentReference } from "firebase/firestore";
import {
  cuttinboardUserConverter,
  FIRESTORE,
  useCuttinboard,
} from "@cuttinboard-solutions/cuttinboard-library";
import {
  ICuttinboardUser,
  Organization,
} from "@cuttinboard-solutions/types-helpers";

type DashboardDataHook = [
  ICuttinboardUser | undefined,
  DocumentData | undefined,
  Organization | undefined,
  boolean
];

export function useDashboardData(): DashboardDataHook {
  const { user } = useCuttinboard();
  const [userDocument, setUserDocument] = useState<ICuttinboardUser>();
  const [subscriptionDocument, setSubscriptionDocument] =
    useState<DocumentData>();
  const [organization, setOrganization] = useState<Organization>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!location) setLoading(true);
    const userDocumentRef = doc(FIRESTORE, "Users", user.uid).withConverter(
      cuttinboardUserConverter
    );
    const subscriptionDocumentRef = doc(
      FIRESTORE,
      "Users",
      user.uid,
      "subscription",
      "subscriptionDetails"
    );
    const organizationRef = doc(
      FIRESTORE,
      "Organizations",
      user.uid
    ) as DocumentReference<Organization>;

    const userDocument$ = docData(userDocumentRef);
    const subscriptionDocument$ = docData(subscriptionDocumentRef);
    const organization$ = docData(organizationRef);

    const combined$ = combineLatest([
      userDocument$,
      subscriptionDocument$,
      organization$,
    ]);

    const subscription = combined$.subscribe(
      ([userDocument, subscriptionDocument, organization]) => {
        loading && setLoading(false);
        setUserDocument(userDocument);
        setSubscriptionDocument(subscriptionDocument);
        setOrganization(organization);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.uid]);

  // Use the useMemo hook to memoize the array of values returned by the hook
  const resArray = useMemo<DashboardDataHook>(
    () => [userDocument, subscriptionDocument, organization, loading],
    [userDocument, subscriptionDocument, organization, loading]
  );

  return resArray;
}
