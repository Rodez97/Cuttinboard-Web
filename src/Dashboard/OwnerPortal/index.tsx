/** @jsx jsx */
import { Location } from "@cuttinboard-solutions/cuttinboard-library";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library/services";
import { FIRESTORE } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { jsx } from "@emotion/react";
import { Layout } from "antd";
import { collection, query, where } from "firebase/firestore";
import { createContext, lazy, Suspense, useContext } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Route, Routes } from "react-router-dom";
import { PageError, PageLoading } from "../../components";

const SupervisorsRouter = lazy(() => import("../Supervisors"));
const MyLocations = lazy(() => import("./MyLocations"));
const AddLocation = lazy(() => import("./AddLocation/AddLocation"));
const EditLocation = lazy(() => import("./EditLocation"));

interface OwnerContextProps {
  locations: Location[];
}

const OwnerContext = createContext<OwnerContextProps>({} as OwnerContextProps);

export default () => {
  const { user } = useCuttinboard();
  const [myLocations, loading, error] = useCollectionData(
    query(
      collection(FIRESTORE, "Locations"),
      where("organizationId", "==", user.uid)
    ).withConverter(Location.firestoreConverter)
  );

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError error={error} />;
  }
  return (
    <OwnerContext.Provider value={{ locations: myLocations ?? [] }}>
      <Layout css={{ overflow: "auto", height: "100%" }}>
        <Routes>
          <Route path="/*">
            <Route
              index
              element={
                <Suspense fallback={<PageLoading />}>
                  <MyLocations />
                </Suspense>
              }
            />
            <Route
              path="locationDetails/:locationId"
              element={
                <Suspense fallback={<PageLoading />}>
                  <EditLocation />
                </Suspense>
              }
            />
            <Route
              path="add-location"
              element={
                <Suspense fallback={<PageLoading />}>
                  <AddLocation />
                </Suspense>
              }
            />
            <Route
              path="supervisors/*"
              element={
                <Suspense fallback={<PageLoading />}>
                  <SupervisorsRouter />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </Layout>
    </OwnerContext.Provider>
  );
};

export const useOwner = () => useContext(OwnerContext);
