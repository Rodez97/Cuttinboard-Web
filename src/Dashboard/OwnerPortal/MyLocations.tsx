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
  Input,
  Layout,
  Modal,
  PageHeader,
  Space,
  Typography,
} from "antd";
import SplitButton from "components/SplitButton";
import dayjs from "dayjs";
import { deleteDoc } from "firebase/firestore";
import { orderBy } from "lodash";
import { matchSorter } from "match-sorter";
import { useMemo, useState } from "react";
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
  const [orderData, setOrderData] = useState<{
    index: number;
    order: "desc" | "asc";
  }>({
    index: 0,
    order: "asc",
  });
  const [searchQuery, setSearchQuery] = useState("");

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

  const getOrderedLocations = useMemo(() => {
    let ordered: Location[] = [];
    switch (orderData.index) {
      case 0:
        ordered = orderBy(locations, "name", orderData.order);
        break;
      case 1:
        ordered = orderBy(locations, "address.city", orderData.order);
        break;
      case 2:
        ordered = orderBy(locations, "intId", orderData.order);
        break;

      default:
        ordered = locations;
        break;
    }
    switch (orderData.index) {
      case 0:
        return matchSorter(ordered, searchQuery, { keys: ["name"] });
      case 1:
        return matchSorter(ordered, searchQuery, { keys: ["address.city"] });
      case 2:
        return matchSorter(ordered, searchQuery, { keys: ["intId"] });

      default:
        return ordered;
    }
  }, [locations, orderData, searchQuery]);

  return (
    <Layout>
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
      <div css={{ padding: "5px 20px" }}>
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
      </div>
      <Layout.Content css={{ padding: "5px 20px" }}>
        <Space
          wrap
          size="large"
          css={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <SplitButton
            options={[t("Name"), t("City"), t("ID")]}
            selectedIndex={orderData.index}
            order={orderData.order}
            onChageOrder={(order) =>
              setOrderData((prev) => ({ ...prev, order }))
            }
            onChange={(index) => setOrderData((prev) => ({ ...prev, index }))}
          />
          <Input.Search
            placeholder={t("Search")}
            css={{ width: 250 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
        </Space>

        {getOrderedLocations?.length > 0 ? (
          <Space wrap size="large">
            {getOrderedLocations.map((loc) => (
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
          <div
            css={{
              display: "flex",
              justifyContent: "center",
              paddingTop: "20px",
            }}
          >
            <Typography.Text type="secondary" css={{ fontSize: 18 }}>
              {t("You haven't created any location.")}
            </Typography.Text>
          </div>
        )}
      </Layout.Content>
    </Layout>
  );
}

export default MyLocations;
