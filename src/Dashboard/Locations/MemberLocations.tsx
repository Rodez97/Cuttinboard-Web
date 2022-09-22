/** @jsx jsx */
import {
  Auth,
  Firestore,
} from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { LocationConverter } from "@cuttinboard-solutions/cuttinboard-library/models";
import { jsx } from "@emotion/react";
import { Space, Typography } from "antd";
import { collection, query, where } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useTranslation } from "react-i18next";
import PageError from "../../components/PageError";
import PageLoading from "../../components/PageLoading";
import LocationCard from "./LocationCard";

function MemberLocations() {
  const { t } = useTranslation();
  const [myLocations, loading, error] = useCollectionData(
    query(
      collection(Firestore, "Locations"),
      where("members", "array-contains", Auth.currentUser.uid)
    ).withConverter(LocationConverter)
  );

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError error={error} />;
  }
  return (
    <div css={{ gap: "16px" }}>
      {myLocations?.length > 0 ? (
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
}

export default MemberLocations;
