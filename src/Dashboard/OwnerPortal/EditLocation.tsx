/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Location } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Layout, message, Result } from "antd";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { recordError } from "../../utils/utils";
import { useOwner } from ".";
import { getAnalytics, logEvent } from "firebase/analytics";
import { PageHeader } from "@ant-design/pro-layout";
import { LocationInfoForm } from "../../shared";

export default () => {
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
    if (!getLocation) {
      throw new Error("Location not found");
    }

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

  if (!getLocation) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the location was not found."
      />
    );
  }

  return (
    <Layout>
      <PageHeader
        onBack={() => navigate(-1)}
        title={t("Edit Location Details")}
      />
      <LocationInfoForm
        baseLocation={getLocation}
        onChange={handleChange}
        onCancel={() => navigate(-1)}
        loading={editing}
      />
    </Layout>
  );
};
