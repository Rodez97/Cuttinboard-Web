/** @jsx jsx */
import {
  FIRESTORE,
  locationConverter,
  useCuttinboard,
} from "@cuttinboard-solutions/cuttinboard-library";
import { jsx } from "@emotion/react";
import { Space, Typography } from "antd";
import { collection, query, where } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useTranslation } from "react-i18next";
import usePageTitle from "../../hooks/usePageTitle";
import { PageError, LoadingPage } from "../../shared";
import LocationCard from "./LocationCard";

export default () => {
  usePageTitle("My Locations");
  const { t } = useTranslation();
  const { user } = useCuttinboard();
  const [myLocations, loading, error] = useCollectionData(
    query(
      collection(FIRESTORE, "Locations"),
      where("members", "array-contains", user.uid)
    ).withConverter(locationConverter)
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
            <LocationCard key={loc.id} location={loc} showBadge />
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
