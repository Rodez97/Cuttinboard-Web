/** @jsx jsx */
import { Auth, Firestore } from "@cuttinboard/cuttinboard-library/firebase";
import { LocationConverter } from "@cuttinboard/cuttinboard-library/models";
import { jsx } from "@emotion/react";
import { Divider, Space, Typography } from "antd";
import { collection, query, where } from "firebase/firestore";
import { groupBy } from "lodash";
import React from "react";
import { useMemo } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useTranslation } from "react-i18next";
import PageError from "../../components/PageError";
import PageLoading from "../../components/PageLoading";
import LocationCard from "./LocationCard";

function SupervisorLocations() {
  const { t } = useTranslation();
  const [myLocations, loading, error] = useCollectionData(
    query(
      collection(Firestore, "Locations"),
      where("supervisors", "array-contains", Auth.currentUser.uid)
    ).withConverter(LocationConverter)
  );

  const groupedByOrganizations = useMemo(
    () => Object.entries(groupBy(myLocations, "organizationId")),
    [myLocations]
  );

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError error={error} />;
  }
  return (
    <div css={{ gap: "16px" }}>
      {groupedByOrganizations?.length ? (
        groupedByOrganizations?.map(([organization, locations], index) => (
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
}

export default SupervisorLocations;
