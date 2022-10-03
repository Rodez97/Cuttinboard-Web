/** @jsx jsx */
import {
  Auth,
  Firestore,
} from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { Location } from "@cuttinboard-solutions/cuttinboard-library/models";
import { jsx } from "@emotion/react";
import { Layout } from "antd";
import { collection, query, where } from "firebase/firestore";
import { createContext, lazy, Suspense, useContext } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Route, Routes } from "react-router-dom";
import PageError from "../../components/PageError";
import PageLoading from "../../components/PageLoading";

const SupervisorsRouter = lazy(
  () => import("../Supervisors/SupervisorsRouter")
);
const MyLocations = lazy(() => import("./MyLocations"));
const AddLocation = lazy(() => import("./AddLocation/AddLocation"));
const EditLocation = lazy(() => import("./EditLocation"));

interface OwnerContextProps {
  locations: Location[];
}

const OwnerContext = createContext<OwnerContextProps>({} as OwnerContextProps);

function OwnerPortal() {
  const [myLocations, loading, error] = useCollectionData(
    query(
      collection(Firestore, "Locations"),
      where("organizationId", "==", Auth.currentUser.uid)
    ).withConverter(Location.Converter)
  );

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError error={error} />;
  }
  return (
    <OwnerContext.Provider value={{ locations: myLocations }}>
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
}

export const useOwner = () => useContext(OwnerContext);

export default OwnerPortal;
