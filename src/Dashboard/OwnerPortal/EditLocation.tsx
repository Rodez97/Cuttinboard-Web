/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Layout, message, Result } from "antd/es";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { recordError } from "../../utils/utils";
import { useOwner } from ".";
import { PageHeader } from "@ant-design/pro-layout";
import { LocationInfoForm } from "../../shared";
import {
  conversationsConverter,
  FIRESTORE,
  locationConverter,
  useCuttinboard,
} from "@rodez97/cuttinboard-library";
import { ILocationInfo } from "./AddLocation/NewLocationTypes";
import { logAnalyticsEvent } from "utils/analyticsHelpers";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";

export default () => {
  const navigate = useNavigate();
  const { user } = useCuttinboard();
  const { t } = useTranslation();
  const { locations } = useOwner();
  const { locationId } = useParams();
  const [editing, setEditing] = useState(false);
  const getLocation = useMemo(
    () => locations?.find((loc) => loc.id === locationId),
    [locations, locationId]
  );

  const handleChange = async (values: ILocationInfo) => {
    const { name, intId, address } = values;
    if (!getLocation) {
      throw new Error("Location not found");
    }

    setEditing(true);
    try {
      const batch = writeBatch(FIRESTORE);

      // Get the conversations for this location
      const conversations = await getDocs(
        query(
          collection(FIRESTORE, "conversations"),
          where("locationId", "==", getLocation.id),
          where("organizationId", "==", user.uid)
        ).withConverter(conversationsConverter)
      );

      // Update the location name in each conversation
      conversations.forEach((conversation) => {
        batch.update(conversation.ref, {
          locationName: name,
        });
      });

      const docRef = doc(FIRESTORE, getLocation.refPath).withConverter(
        locationConverter
      );

      // Update the location name in the location document
      batch.set(
        docRef,
        {
          name,
          intId,
          address,
        },
        { merge: true }
      );

      // Commit the batch
      await batch.commit();

      message.success(t("Changes saved"));
      setEditing(false);
      // Report location update from card to analytics
      // Get the filled fields
      const usedFields = Object.keys(values).filter(
        (key) => values[key as keyof ILocationInfo]
      );
      // Report to analytics
      logAnalyticsEvent("location_updated", {
        usedFields,
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
        subTitle="Sorry, the location was not found"
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
