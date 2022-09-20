import {
  DocumentData,
  FieldPath,
  FirestoreError,
  getDocs,
  getDocsFromCache,
  getDocsFromServer,
  query,
  Query,
  where,
} from "firebase/firestore";
import { chunk } from "lodash";
import { useEffect, useMemo } from "react";
import {
  GetOptions,
  OnceOptions,
  Options,
} from "react-firebase-hooks/firestore/dist/firestore/types";
import { useIsFirestoreQueryEqual } from "./useIsFirestoreQueryEqual";
import useLoadingValue from "./useLoadingValue";

type ExtendedCollectionDataOnceHook<T = DocumentData> = [
  T[],
  boolean,
  FirestoreError,
  () => Promise<void>
];

function useExtendedCollectionOnceQuery<T = DocumentData>(
  baseQuery?: Query<T> | null,
  field?: string | FieldPath,
  inData?: string[],
  options?: OnceOptions
): ExtendedCollectionDataOnceHook<T> {
  const { error, loading, reset, setError, setValue, value } = useLoadingValue<
    T[],
    FirestoreError
  >();
  let effectActive = true;
  const ref = useIsFirestoreQueryEqual<Query<T>>(baseQuery, reset);

  const loadData = async (
    loadQuery?: Query<T> | null,
    options?: Options & OnceOptions
  ) => {
    if (!loadQuery || !inData || !field) {
      setValue(undefined);
      return;
    }
    const get = getDocsFnFromGetOptions(options?.getOptions);

    try {
      let queries = chunk(inData, 10).map((queryChunk) =>
        get(query(loadQuery, where(field, "in", queryChunk)))
      );
      const result = await Promise.all(queries);
      const combineQueries = result.flatMap((rs) =>
        rs.docs.map((doc) => doc.data())
      );
      if (effectActive) {
        setValue(combineQueries);
      }
    } catch (error) {
      if (effectActive) {
        setError(error as FirestoreError);
      }
    }
  };

  useEffect(() => {
    loadData(ref.current, options);

    return () => {
      effectActive = false;
    };
  }, [ref.current]);

  const resArray: ExtendedCollectionDataOnceHook<T> = [
    value as T[],
    loading,
    error,
    () => loadData(ref.current, options),
  ];

  return useMemo(() => resArray, resArray);
}

const getDocsFnFromGetOptions = (
  { source }: GetOptions = { source: "default" }
) => {
  switch (source) {
    default:
    case "default":
      return getDocs;
    case "cache":
      return getDocsFromCache;
    case "server":
      return getDocsFromServer;
  }
};

export default useExtendedCollectionOnceQuery;
