/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../../utils/utils";
import { useNavigate } from "react-router-dom";
import { message, Typography } from "antd";
import { getAnalytics, logEvent } from "firebase/analytics";
import React from "react";
import { LocationEditor } from "../../components";
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Location } from "@cuttinboard-solutions/cuttinboard-library/models";

function LocationSettings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { location } = useCuttinboardLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = async ({
    name,
    email,
    description,
    phoneNumber,
    intId,
    address,
  }: Partial<Location>) => {
    setIsSubmitting(true);
    try {
      await location.updateLocation({
        name,
        email,
        description,
        phoneNumber,
        intId,
        address,
      });
      message.success(t("Changes saved"));
      // Report to analytics
      const analytics = getAnalytics();
      logEvent(analytics, "update_location", {
        from: "location_settings_inner",
      });
    } catch (error) {
      recordError(error);
    }
    setIsSubmitting(false);
  };

  return (
    <React.Fragment>
      <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
        <div
          css={{ minWidth: 270, maxWidth: 400, margin: "auto", width: "100%" }}
        >
          <Typography.Title css={{ textAlign: "center" }}>
            {t("Location information")}
          </Typography.Title>
          <LocationEditor
            baseLocation={location}
            onChange={handleChange}
            onCancel={() => navigate(-1)}
            loading={isSubmitting}
          />
        </div>
      </div>
    </React.Fragment>
  );
}

export default LocationSettings;
