/** @jsx jsx */
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { PageHeader } from "@ant-design/pro-layout";
import { Location } from "@cuttinboard-solutions/cuttinboard-library/models";
import { jsx } from "@emotion/react";
import { Alert, Button, Input, Layout, Result, Space, Typography } from "antd";
import dayjs from "dayjs";
import { matchSorter } from "match-sorter";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SplitButton } from "../../components";
import { useDashboard } from "../DashboardProvider";
import LocationCard from "../Locations/LocationCard";
import { customOrderSorter } from "./customOrderSorter";
import DeleteLocationDialog, {
  DeleteLocationDialogRef,
} from "./DeleteLocationDialog";
import { useOwner } from ".";

export default () => {
  const { t } = useTranslation();
  const deleteLocDialogRef = useRef<DeleteLocationDialogRef>(null);
  const { locations } = useOwner();
  const navigate = useNavigate();
  const { organization, userDocument } = useDashboard();
  const [{ order, index }, setOrderData] = useState<{
    index: number;
    order: "desc" | "asc";
  }>({
    index: 0,
    order: "asc",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const deleteLocation = (loc: Location) => {
    deleteLocDialogRef.current?.openDialog(loc);
  };

  const getOrderedLocations = useMemo(() => {
    switch (index) {
      case 0:
        return matchSorter(locations, searchQuery, {
          keys: ["name"],
          baseSort: customOrderSorter(order),
        });
      case 1:
        return matchSorter(locations, searchQuery, {
          keys: ["address.city"],
          baseSort: customOrderSorter(order),
        });
      case 2:
        return matchSorter(locations, searchQuery, {
          keys: ["intId"],
          baseSort: customOrderSorter(order),
        });
      default:
        return locations;
    }
  }, [locations, order, index, searchQuery]);

  if (!organization) {
    return <Result status="error" title="Organization not found" />;
  }

  return (
    <Layout>
      <PageHeader
        backIcon={false}
        title={t("My Locations")}
        extra={[
          <Button
            key="2"
            onClick={() => navigate("supervisors")}
            disabled={Boolean(organization.subscriptionStatus === "canceled")}
          >
            {t("Supervisors")}
          </Button>,
          <Button
            key="1"
            type="primary"
            onClick={() => navigate("add-location")}
            disabled={Boolean(organization.subscriptionStatus === "canceled")}
          >
            {t("Create Location")}
          </Button>,
        ]}
      />
      <div css={{ padding: "5px 20px" }}>
        {organization.subscriptionStatus !== "canceled" &&
          (!userDocument?.paymentMethods ||
            userDocument?.paymentMethods.length < 1) && (
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
            selectedIndex={index}
            order={order}
            onChangeOrder={(order) => {
              setOrderData((prev) => ({ ...prev, order }));
            }}
            onChange={(index) => setOrderData((prev) => ({ ...prev, index }))}
          />
          <Input.Search
            placeholder={t("Search")}
            css={{ width: 250 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            allowClear
          />
        </Space>

        {getOrderedLocations?.length > 0 ? (
          <Space wrap size="large">
            {getOrderedLocations.map((loc) => (
              <LocationCard
                key={loc.id}
                location={loc}
                actions={
                  !(organization.subscriptionStatus === "canceled")
                    ? [
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
                      ]
                    : []
                }
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
              {t("No locations.")}
            </Typography.Text>
          </div>
        )}
      </Layout.Content>
      <DeleteLocationDialog ref={deleteLocDialogRef} />
    </Layout>
  );
};
