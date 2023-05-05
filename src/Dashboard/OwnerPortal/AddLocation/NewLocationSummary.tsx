/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, Typography } from "antd";
import { useDashboard } from "../../DashboardProvider";
import { CreditCardOutlined } from "@ant-design/icons";

function NewLocationSummary() {
  const { t } = useTranslation();
  const { subscriptionDocument, organization } = useDashboard();

  const getPrice = useCallback(() => {
    const price = subscriptionDocument?.items[0]?.price.unit_amount / 100;
    const newQuantity = Number(organization?.locations) + 1;
    return price * newQuantity;
  }, [subscriptionDocument, organization]);

  const getPriceText = useCallback(() => {
    const price = subscriptionDocument?.items[0]?.price.unit_amount / 100;
    const newQuantity = Number(organization?.locations) + 1;
    return t(`{{0}} locations x {{1}}`, {
      0: newQuantity,
      1: price.toLocaleString("EN-us", {
        style: "currency",
        currency: "USD",
      }),
    });
  }, [subscriptionDocument?.items, organization?.locations, t]);

  return (
    <div
      css={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
      }}
    >
      <Avatar
        icon={<CreditCardOutlined />}
        css={{
          backgroundColor: "transparent",
          color: "#000",
          border: "1px solid #000",
        }}
      />
      <div
        css={{
          marginLeft: "1rem",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography.Text strong>{t("Your new bill will be:")}</Typography.Text>
        <Typography.Text
          css={{
            fontSize: "1rem",
            margin: "0.2rem 0",
          }}
        >
          {getPrice().toLocaleString("EN-us", {
            style: "currency",
            currency: "USD",
          })}
          <Typography.Text type="secondary">{t("/month")}</Typography.Text>
        </Typography.Text>
        <Typography.Text type="secondary">{getPriceText()}</Typography.Text>
      </div>
    </div>
  );
}

export default NewLocationSummary;
