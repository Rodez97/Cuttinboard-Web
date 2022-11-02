/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Location } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Layout, message, PageHeader } from "antd";
import { updateDoc } from "firebase/firestore";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import LocationEditor from "../../components/LocationEditor";
import { recordError } from "../../utils/utils";
import { useOwner } from "./OwnerPortal";
import { getAnalytics, logEvent } from "firebase/analytics";

function EditLocation() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { locations } = useOwner();
  const { locationId } = useParams();
  const [editing, setEditing] = useState(false);
  const getLocation = useMemo(
    () => locations?.find((loc) => loc.id === locationId),
    [locations, locationId]
  );

  const handleChange = async ({
    name,
    email,
    description,
    phoneNumber,
    intId,
    address,
  }: Partial<Location>) => {
    setEditing(true);
    try {
      await getLocation.updateLocation({
        name,
        email,
        description,
        phoneNumber,
        intId,
        address,
      });
      message.success(t("Changes saved"));
      setEditing(false);
      // Report location update from card to analytics
      logEvent(getAnalytics(), "update_location", {
        location_id: getLocation.id,
        updated_from: "owner_portal",
      });
    } catch (error) {
      recordError(error);
      message.error(t("Error saving changes"));
      setEditing(false);
    }
  };
  return (
    <Layout>
      <PageHeader
        onBack={() => navigate(-1)}
        title={t("Edit Location Details")}
      />
      <Layout.Content css={{ display: "flex", justifyContent: "center" }}>
        <div>
          <LocationEditor
            baseLocation={getLocation}
            onChange={handleChange}
            onCancel={() => navigate(-1)}
            loading={editing}
          />
        </div>
      </Layout.Content>
    </Layout>
  );
}

export default EditLocation;
