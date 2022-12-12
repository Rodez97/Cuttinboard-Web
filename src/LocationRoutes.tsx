import { EmployeesProvider } from "@cuttinboard-solutions/cuttinboard-library/employee";
import {
  LocationProvider,
  useCuttinboard,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { useDisclose } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Result } from "antd";
import { getAnalytics, logEvent } from "firebase/analytics";
import React, { useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { PageError, RootLoading } from "./shared";
import { useSelectedLocation } from "./hooks";
import LocationContainer from "./LocationContainer";

function LocationRoutes() {
  const { t } = useTranslation();
  const { organizationId, locationId } = useParams();
  const { organizationKey, selectOrganizationLocation } = useCuttinboard();
  const { selectedLocation, selectLocation: selectLocId } =
    useSelectedLocation();
  const [loading, , endLoading] = useDisclose(true);
  const [error, setError] = useState<Error | null>(null);

  useLayoutEffect(() => {
    if (
      organizationId &&
      locationId &&
      organizationId !== organizationKey?.orgId
    ) {
      // The user has selected a different organization, so we need to select the new organization
      selectOrganizationLocation(organizationId)
        .then(() => {
          selectLocId(locationId);
          logEvent(getAnalytics(), "select_location", {
            locationId,
          });
        })
        .catch((err) => {
          setError(err);
        })
        .finally(() => {
          endLoading();
        });
    } else if (locationId && locationId !== selectedLocation) {
      // The user has selected a different location, so we need to select the new location
      selectLocId(locationId);
      endLoading();
    } else {
      // The user has selected the same location and we don't need to do anything
      endLoading();
    }
  }, [
    locationId,
    selectedLocation,
    organizationKey,
    organizationId,
    selectOrganizationLocation,
    selectLocId,
    endLoading,
  ]);

  if (loading) {
    return <RootLoading />;
  }

  if (error) {
    return <PageError error={error} />;
  }

  if (!organizationKey || !locationId || !organizationId) {
    return <Result status="error" title={t("Not Found")} />;
  }

  return (
    <LocationProvider
      organizationKey={organizationKey}
      locationId={locationId}
      LoadingComponent={() => <RootLoading />}
      ErrorComponent={(e) => <PageError error={e} />}
    >
      <EmployeesProvider ErrorRender={(e) => <PageError error={e} />}>
        <LocationContainer />
      </EmployeesProvider>
    </LocationProvider>
  );
}

export default LocationRoutes;
