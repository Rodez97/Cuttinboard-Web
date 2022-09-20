/** @jsx jsx */
import {
  CrownOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Location } from "@cuttinboard/cuttinboard-library/models";
import { jsx } from "@emotion/react";
import {
  Alert,
  Button,
  Layout,
  Modal,
  PageHeader,
  Space,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { deleteDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { recordError } from "../../utils/utils";
import { useDashboard } from "../DashboardProvider";
import LocationCard from "../Locations/LocationCard";
import GoldTag from "./GoldTag";
import { useOwner } from "./OwnerPortal";

function MyLocations() {
  const { t } = useTranslation();
  const { locations } = useOwner();
  const navigate = useNavigate();
  const { organization, subscriptionDocument } = useDashboard();

  const deleteLocation = (loc: Location) => {
    Modal.confirm({
      title: t("Are you sure you want to delete this location?"),
      content: t("Otra advertencia"),
      icon: <ExclamationCircleOutlined />,
      okText: t("Yes"),
      okType: "danger",
      cancelText: t("No"),
      async onOk() {
        try {
          await deleteDoc(loc.docRef);
        } catch (error) {
          return recordError(error);
        }
      },
      onCancel() {},
    });
  };

  return (
    <Layout.Content>
      <PageHeader
        backIcon={false}
        title={t("My Locations")}
        tags={[
          <GoldTag key={"owner"} icon={<CrownOutlined />}>
            {t("Owner")}
          </GoldTag>,
        ]}
        extra={[
          <Button key="2" onClick={() => navigate("supervisors")}>
            {t("Supervisors")}
          </Button>,
          <Button
            key="1"
            type="primary"
            onClick={() => navigate("add-location")}
          >
            {t("Create Location")}
          </Button>,
        ]}
      />
      <div css={{ gap: "16px", padding: "20px" }}>
        {organization.subscriptionStatus !== "canceled" &&
          !subscriptionDocument?.default_payment_method && (
            <Alert
              message={t(
                "No payment method saved. Declare a payment method to keep accessing the Owner plan."
              )}
              type="warning"
              showIcon
              action={
                <Button
                  type="link"
                  onClick={() => navigate("/dashboard/subscription")}
                >
                  {t("Manage Billing")}
                </Button>
              }
            />
          )}

        {organization.subscriptionStatus === "canceled" && (
          <Alert
            message={t(
              "Your plan was cancelled on {{0}}, all your locations will be deleted after 15 days.",
              {
                0: dayjs(organization.cancellationDate?.toDate()).format(
                  "MM/DD/YYYY"
                ),
              }
            )}
            type="error"
            showIcon
          />
        )}

        {locations?.length > 0 ? (
          <Space wrap size="large" css={{ padding: "10px" }}>
            {locations.map((loc) => (
              <LocationCard
                key={loc.id}
                location={loc}
                actions={[
                  <Button
                    key="edit"
                    icon={<EditOutlined />}
                    type="link"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`locationDetails/${loc.id}`);
                    }}
                  />,
                  <Button
                    key="delete"
                    icon={<DeleteOutlined />}
                    danger
                    type="link"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLocation(loc);
                    }}
                  />,
                ]}
              />
            ))}
          </Space>
        ) : (
          <Typography.Title>
            {t("You haven't created any location.")}
          </Typography.Title>
        )}
      </div>
    </Layout.Content>
  );
}

export default MyLocations;
