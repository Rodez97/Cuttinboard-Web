import {
  EmployeesProvider,
  LocationProvider,
  useCuttinboard,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { Result } from "antd";
import { getAnalytics, logEvent } from "firebase/analytics";
import React, { useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { LoadingScreen, PageError } from "./components";
import { useDisclose, useSelectedLocation } from "./hooks";
import { LocationContainer } from "./LocationContainer";

function LocationRoutes() {
  const { t } = useTranslation();
  const { organizationId, locationId } = useParams();
  const { organizationKey, selectLocation } = useCuttinboard();
  const { selectedLocation, selectLocation: selectLocId } =
    useSelectedLocation();
  const [loading, , endLoading] = useDisclose(true);
  const [error, setError] = useState<Error>(null);

  useLayoutEffect(() => {
    if (organizationId !== organizationKey?.orgId) {
      // The user has selected a different organization, so we need to select the new organization
      selectLocation(organizationId)
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
    } else if (locationId !== selectedLocation) {
      // The user has selected a different location, so we need to select the new location
      selectLocId(locationId);
      endLoading();
    } else {
      // The user has selected the same location and we don't need to do anything
      endLoading();
    }
  }, [locationId, selectedLocation, organizationKey, organizationId]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <PageError error={error} />;
  }

  if (!organizationKey) {
    return <Result status="error" title={t("error.organizationId")} />;
  }

  return (
    <LocationProvider organizationKey={organizationKey} locationId={locationId}>
      {({ loading, error }) =>
        loading ? (
          <LoadingScreen />
        ) : error ? (
          <PageError error={error} />
        ) : (
          <EmployeesProvider>
            <LocationContainer />
          </EmployeesProvider>
        )
      }
    </LocationProvider>
  );
}

export default LocationRoutes;
