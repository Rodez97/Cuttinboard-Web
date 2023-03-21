import React, { useEffect, useState } from "react";
import DMMain from "./DMMain";
import { doc, getDoc } from "firebase/firestore";
import { LoadingPage, NotFound } from "../../shared";
import {
  cuttinboardUserConverter,
  employeesSelectors,
  FIRESTORE,
  useAppSelector,
  useCuttinboard,
} from "@cuttinboard-solutions/cuttinboard-library";
import ErrorPage from "../../shared/molecules/PageError";
import {
  getDmRecipient,
  ICuttinboardUser,
  IDirectMessage,
  IEmployee,
} from "@cuttinboard-solutions/types-helpers";

export default ({
  selectedDirectMessage,
}: {
  selectedDirectMessage: IDirectMessage;
}) => {
  const { user } = useCuttinboard();
  const getEmployees = useAppSelector(employeesSelectors.selectAll);
  const [recipientUser, setRecipientUser] = useState<
    ICuttinboardUser | IEmployee | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const recipient = getDmRecipient(selectedDirectMessage, user.uid);

    if (getEmployees && getEmployees.length > 0) {
      const employee = getEmployees.find((e) => e.id === recipient._id);
      if (employee) {
        setRecipientUser(employee);
        setLoading(false);
        return;
      }
    }

    const userRef = doc(FIRESTORE, "Users", recipient._id).withConverter(
      cuttinboardUserConverter
    );

    getDoc(userRef)
      .then((doc) => {
        if (doc.exists()) {
          setRecipientUser(doc.data());
        } else {
          setError(new Error("User does not exist"));
        }
      })
      .catch((err) => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [getEmployees, selectedDirectMessage, user.uid]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPage error={error} />;
  }

  if (!recipientUser) {
    return <NotFound />;
  }

  return (
    <DMMain
      employee={recipientUser}
      selectedDirectMessage={selectedDirectMessage}
    />
  );
};
