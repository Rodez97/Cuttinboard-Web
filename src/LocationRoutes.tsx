import React, { lazy, useLayoutEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { PageError } from "./shared";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library";

const RootLoading = lazy(() => import("./shared/molecules/RootLoading"));

function LocationRoutes() {
  const { organizationId, locationId } = useParams();
  const { organizationKey, selectLocationKey, loading } = useCuttinboard();
  const [loadingKey, selLoadingKey] = useState(true);
  const [selectingLocError, setError] = useState<Error | null>(null);

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

  if (loadingKey || loading) {
    return <RootLoading />;
  }

  if (selectingLocError) {
    return <PageError error={selectingLocError} />;
  }

  if (!organizationKey) {
    const error = new Error("Organization not found");
    return <PageError error={error} />;
  }

  return <Navigate to="/location" />;
}

export default LocationRoutes;
