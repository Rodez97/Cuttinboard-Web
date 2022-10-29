/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../utils/utils";
import { useNavigate } from "react-router-dom";
import {
  useCuttinboard,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import OverflowLayout from "../components/OverflowLayout";
import { Layout, message, PageHeader } from "antd";
import LocationEditor from "../components/LocationEditor";
import { Location } from "@cuttinboard-solutions/cuttinboard-library/models";

function LocationSettings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loadCredential, user } = useCuttinboard();
  const { location } = useLocation();
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
      await loadCredential(user);
      message.success(t("Changes saved"));
    } catch (error) {
      recordError(error);
    }
    setIsSubmitting(false);
  };

  return (
    <OverflowLayout>
      <PageHeader
        onBack={() => navigate(-1)}
        title={t("Location information")}
        subTitle={location.name}
      />
      <Layout.Content
        css={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 20,
        }}
      >
        <LocationEditor
          baseLocation={location}
          onChange={handleChange}
          onCancel={() => navigate(-1)}
          loading={isSubmitting}
        />
      </Layout.Content>
    </OverflowLayout>
  );
}

export default LocationSettings;
