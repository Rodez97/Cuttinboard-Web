/** @jsx jsx */
import { jsx } from "@emotion/react";
import { deleteDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { recordError } from "../utils/utils";
import { useNavigate } from "react-router-dom";
import {
  useCuttinboard,
  useLocation,
} from "@cuttinboard/cuttinboard-library/services";
import OverflowLayout from "../components/OverflowLayout";
import { Button, Divider, Layout, message, Modal, PageHeader } from "antd";
import { DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import LocationEditor from "../components/LocationEditor";
import { Location } from "@cuttinboard/cuttinboard-library/models";

function LocationSettings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loadCredential, user } = useCuttinboard();
  const { locationDocRef, location } = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deleteLocation = async () => {
    Modal.confirm({
      title: t("Are you sure you want to delete this location?"),
      content: t("Otra advertencia"),
      icon: <ExclamationCircleOutlined />,
      okText: t("Yes"),
      okType: "danger",
      cancelText: t("No"),
      async onOk() {
        try {
          navigate("/dashboard");
          await deleteDoc(locationDocRef);
        } catch (error) {
          return recordError(error);
        }
      },
      onCancel() {},
    });
  };

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
      await updateDoc(locationDocRef, {
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
        className="site-page-header-responsive"
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
        <Divider />
        <Button
          disabled={isSubmitting}
          icon={<DeleteOutlined />}
          size="large"
          type="primary"
          danger
          onClick={deleteLocation}
          css={{ width: 300 }}
        >
          {t("Remove Location")}
        </Button>
      </Layout.Content>
    </OverflowLayout>
  );
}

export default LocationSettings;
