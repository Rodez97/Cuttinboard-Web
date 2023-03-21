/** @jsx jsx */
import {
  FIRESTORE,
  locationConverter,
  useCuttinboard,
} from "@cuttinboard-solutions/cuttinboard-library";
import { ILocation } from "@cuttinboard-solutions/types-helpers";
import { jsx } from "@emotion/react";
import { Layout } from "antd";
import { collection, query, where } from "firebase/firestore";
import { createContext, lazy, Suspense, useContext } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { Route, Routes } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import { PageError, LoadingPage } from "../../shared";
import { useDashboard } from "../DashboardProvider";

const SupervisorsRouter = lazy(() => import("../Supervisors"));
const MyLocations = lazy(() => import("./MyLocations"));
const AddLocation = lazy(() => import("./AddLocation/AddLocation"));
const EditLocation = lazy(() => import("./EditLocation"));

interface OwnerContextProps {
  locations: ILocation[];
}

const OwnerContext = createContext<OwnerContextProps>({} as OwnerContextProps);

export default () => {
  usePageTitle("Owner Portal");
  const { user } = useCuttinboard();
  const { organization } = useDashboard();
  const [myLocations, loading, error] = useCollectionData(
    query(
      collection(FIRESTORE, "Locations"),
      where("organizationId", "==", user.uid)
    ).withConverter(locationConverter)
  );

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <PageError error={error} />;
  }
  return (
    <OwnerContext.Provider value={{ locations: myLocations ?? [] }}>
      <Layout css={{ overflow: "auto", height: "100%" }}>
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            <Route path="/*">
              <Route index element={<MyLocations />} />
              <Route
                path="locationDetails/:locationId"
                element={<EditLocation />}
              />
              <Route path="add-location" element={<AddLocation />} />

              {Boolean(organization?.hadMultipleLocations) && (
                <Route path="supervisors/*" element={<SupervisorsRouter />} />
              )}
            </Route>
          </Routes>
        </Suspense>
      </Layout>
    </OwnerContext.Provider>
  );
};

export const useOwner = () => useContext(OwnerContext);
