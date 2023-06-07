/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Avatar, Typography } from "antd/es";
import { useDashboard } from "../../DashboardProvider";
import { CreditCardOutlined } from "@ant-design/icons";
import {
  DiscountCoupon,
  applyDiscount,
  getDiscountTextFn,
} from "../../Subscription";

function NewLocationSummary() {
  const { t } = useTranslation();
  const { subscriptionDocument, organization } = useDashboard();

  const getPrice = useMemo(() => {
    const unitPrice = subscriptionDocument?.items[0]?.price.unit_amount / 100;
    const newQuantity = Number(organization?.locations) + 1;
    const price = newQuantity * unitPrice;
    const discount = subscriptionDocument?.discount?.coupon;

    const priceText = price.toLocaleString("EN-us", {
      style: "currency",
      currency: "USD",
    });

    if (discount) {
      const priceWithCoupon = applyDiscount(price, discount);
      const priceWithCouponText = priceWithCoupon.toLocaleString("EN-us", {
        style: "currency",
        currency: "USD",
      });

      return (
        <React.Fragment>
          <span css={{ textDecoration: "line-through" }}>{priceText}</span>{" "}
          {priceWithCouponText}
        </React.Fragment>
      );
    }

    return priceText;
  }, [subscriptionDocument, organization]);

  const getDiscountText = useMemo<string | undefined>(() => {
    const discount: DiscountCoupon | undefined =
      subscriptionDocument?.discount?.coupon;
    return getDiscountTextFn(discount, t);
  }, [subscriptionDocument?.discount?.coupon, t]);

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
          {getPrice}
          <Typography.Text type="secondary">{t("/month")}</Typography.Text>
        </Typography.Text>
        <Typography.Text type="secondary">{getPriceText()}</Typography.Text>
        {getDiscountText && (
          <Typography.Text type="success">{getDiscountText}</Typography.Text>
        )}
      </div>
    </div>
  );
}

export default NewLocationSummary;
