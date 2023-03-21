import React, { lazy, Suspense, useLayoutEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { LoadingPage, PageError } from "./shared";
import {
  LocationProvider,
  useCuttinboard,
} from "@cuttinboard-solutions/cuttinboard-library";

const RootLoading = lazy(() => import("./shared/molecules/RootLoading"));
const LocationContainer = lazy(() => import("./LocationContainer"));

function LocationRoutes() {
  const { organizationId, locationId } = useParams();
  const { organizationKey, selectLocationKey, refreshingUser } =
    useCuttinboard();
  const [loadingKey, selLoadingKey] = useState(true);
  const [selectingLocError, setError] = useState<Error | null>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const sameKey =
      organizationKey?.orgId === organizationId &&
      organizationKey?.locId === locationId;
    if (sameKey) {
      selLoadingKey(false);
      return;
    }
    if (organizationId && locationId) {
      selectLocationKey(organizationId, locationId)
        .catch(setError)
        .finally(() => {
          selLoadingKey(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId, organizationId, selectLocationKey]);

  // React to organizationKey changes while in the same route
  useLayoutEffect(() => {
    if (loadingKey || !organizationKey || refreshingUser) {
      return;
    }
    const sameRoute = pathname.startsWith(
      `/l/${organizationKey.orgId}/${organizationKey.locId}`
    );
    if (!sameRoute) {
      navigate(`/dashboard`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationKey]);

  if (loadingKey || refreshingUser) {
    return <RootLoading />;
  }

  if (selectingLocError) {
    return <PageError error={selectingLocError} />;
  }

  if (!organizationKey) {
    const error = new Error("Organization not found");
    return <PageError error={error} />;
  }

  return (
    <Suspense fallback={<LoadingPage />}>
      <LocationProvider>
        {({ loading, error }) => {
          if (loading) {
            return <RootLoading />;
          }
          if (error) {
            return <PageError error={new Error(error)} />;
          }

          return <LocationContainer />;
        }}
      </LocationProvider>
    </Suspense>
  );
}

export default LocationRoutes;
