/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Location } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Layout, PageHeader } from "antd";
import { updateDoc } from "firebase/firestore";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import LocationEditor from "../../components/LocationEditor";
import { recordError } from "../../utils/utils";
import { useOwner } from "./OwnerPortal";

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
      await updateDoc(getLocation.docRef, {
        name,
        email,
        description,
        phoneNumber,
        intId,
        address,
      });
      setEditing(false);
      navigate(-1);
    } catch (error) {
      recordError(error);
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
