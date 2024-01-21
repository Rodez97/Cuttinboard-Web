/** @jsx jsx */
import { useCuttinboard } from "@rodez97/cuttinboard-library";
import { jsx } from "@emotion/react";
import { Space, Typography } from "antd/es";
import { where } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import usePageTitle from "../../hooks/usePageTitle";
import { PageError, LoadingPage } from "../../shared";
import LocationCard from "./LocationCard";
import useLocationsQuery from "./useLocationsQuery";

export default () => {
  usePageTitle("My Locations");
  const { t } = useTranslation();
  const { user } = useCuttinboard();
  const { locations, loading, error } = useLocationsQuery(
    where("members", "array-contains", user.uid)
  );

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <PageError error={error} />;
  }
  return (
    <div css={{ gap: "16px" }}>
      {locations && locations.length > 0 ? (
        <Space wrap size="large">
          {locations.map((loc) => (
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
            {t("You don't belong to a location yet")}
          </Typography.Text>
        </div>
      )}
    </div>
  );
};
