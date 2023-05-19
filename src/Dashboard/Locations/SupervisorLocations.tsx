/** @jsx jsx */
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library";
import { jsx } from "@emotion/react";
import { Divider, Space } from "antd/es";
import { where } from "firebase/firestore";
import groupBy from "lodash-es/groupBy";
import React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import { PageError, LoadingPage } from "../../shared";
import LocationCard from "./LocationCard";
import EmptyExtended from "./../../shared/molecules/EmptyExtended";
import useLocationsQuery from "./useLocationsQuery";

export default () => {
  usePageTitle("Supervised Locations");
  const { t } = useTranslation();
  const { user } = useCuttinboard();
  const { locations, loading, error } = useLocationsQuery(
    where("supervisors", "array-contains", user.uid)
  );

  const groupedByOrganizations = useMemo(
    () => Object.entries(groupBy(locations, "organizationId")),
    [locations]
  );

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <PageError error={error} />;
  }
  return (
    <div css={{ gap: "16px" }}>
      {groupedByOrganizations?.length ? (
        groupedByOrganizations.map(([organization, locations], index) => (
          <React.Fragment key={organization}>
            <Divider orientation="left">{`${t("Organization")} # ${
              index + 1
            }`}</Divider>
            <Space wrap size="large">
              {locations.map((loc) => (
                <LocationCard key={loc.id} location={loc} />
              ))}
            </Space>
          </React.Fragment>
        ))
      ) : (
        <EmptyExtended
          descriptions={[
            "Keep an eye on all the activity happening in your assigned locations",
            "Monitor your assigned locations and help them identify any issues or opportunities for improvement",
            "Oversee your assigned locations and make sure that company standards are being met",
          ]}
          description={
            <p>
              {t("You are not supervising any location")}
              {". "}
              <Link
                to="https://www.cuttinboard.com/help/supervisors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("Learn more")}
              </Link>
            </p>
          }
        />
      )}
    </div>
  );
};
