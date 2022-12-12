/** @jsx jsx */
import { Location } from "@cuttinboard-solutions/cuttinboard-library";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library/services";
import { FIRESTORE } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { jsx } from "@emotion/react";
import { Space, Typography } from "antd";
import { collection, query, where } from "firebase/firestore";
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
      where("members", "array-contains", user.uid)
    ).withConverter(Location.firestoreConverter)
  );

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <PageError error={error} />;
  }
  return (
    <div css={{ gap: "16px" }}>
      {myLocations && myLocations.length > 0 ? (
        <Space wrap size="large">
          {myLocations.map((loc) => (
            <LocationCard key={loc.id} location={loc} />
          ))}
        </Space>
      ) : (
        <div
          css={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "20px",
          }}
        >
          <Typography.Text type="secondary" css={{ fontSize: 18 }}>
            {t("You don't belong to a location yet.")}
          </Typography.Text>
        </div>
      )}
    </div>
  );
};
