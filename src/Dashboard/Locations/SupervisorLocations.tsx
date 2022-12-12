/** @jsx jsx */
import { Location } from "@cuttinboard-solutions/cuttinboard-library";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library/services";
import { FIRESTORE } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { jsx } from "@emotion/react";
import { Divider, Space, Typography } from "antd";
import { collection, query, where } from "firebase/firestore";
import { groupBy } from "lodash";
import React from "react";
import { useMemo } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useTranslation } from "react-i18next";
import { PageError, LoadingPage } from "../../shared";
import LocationCard from "./LocationCard";

export default () => {
  const { t } = useTranslation();
  const { user } = useCuttinboard();
  const [myLocations, loading, error] = useCollectionData(
    query(
      collection(FIRESTORE, "Locations"),
      where("supervisors", "array-contains", user.uid)
    ).withConverter(Location.firestoreConverter)
  );

  const groupedByOrganizations = useMemo(
    () => Object.entries(groupBy(myLocations, "organizationId")),
    [myLocations]
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
        <div
          css={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "20px",
          }}
        >
          <Typography.Text type="secondary" css={{ fontSize: 18 }}>
            {t("You are not supervising any location.")}
          </Typography.Text>
        </div>
      )}
    </div>
  );
};
