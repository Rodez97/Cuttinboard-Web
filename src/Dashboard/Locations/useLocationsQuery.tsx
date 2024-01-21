import {
  FIRESTORE,
  listReducer,
  locationConverter,
} from "@rodez97/cuttinboard-library";
import { ILocation } from "@rodez97/types-helpers";
import {
  QueryConstraint,
  collection,
  onSnapshot,
  query,
} from "firebase/firestore";
import { useEffect, useReducer, useState } from "react";
import { recordError } from "../../utils/utils";

function useLocationsQuery(...queryConstraints: QueryConstraint[]) {
  const [locations, dispatch] = useReducer(listReducer<ILocation>("id"), []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    setLoading(true);

    const queryRef = query(
      collection(FIRESTORE, "Locations"),
      ...queryConstraints
    ).withConverter(locationConverter);

    const unsubscribe = onSnapshot(
      queryRef,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            dispatch({ type: "ADD_ELEMENT", payload: change.doc.data() });
          }
          if (change.type === "modified") {
            dispatch({ type: "SET_ELEMENT", payload: change.doc.data() });
          }
          if (change.type === "removed") {
            dispatch({ type: "DELETE_BY_ID", payload: change.doc.id });
          }
        });
        setLoading(false);
      },
      (err) => {
        setError(err);
        recordError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      dispatch({ type: "CLEAR" });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { locations, loading, error };
}

export default useLocationsQuery;
