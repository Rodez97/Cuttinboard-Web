/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useMemo, useRef } from "react";
import dayjs from "dayjs";
import { TFunction, useTranslation } from "react-i18next";
import capitalize from "lodash-es/capitalize";
import { useDashboard } from "./DashboardProvider";
import { Alert, Button, Descriptions, Modal, Result, Space } from "antd/es";
import { CreditCardTwoTone } from "@ant-design/icons";
import usePageTitle from "../hooks/usePageTitle";
import SetupPaymentMethodForm, {
  SetupPMDialogRef,
} from "./SetupPaymentMethodForm";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library";
import { GrayPageHeader } from "../shared";
import { logAnalyticsEvent } from "utils/analyticsHelpers";

export type DiscountCoupon = {
  duration: "forever" | "once" | "repeating";
  duration_in_months: number;
  percent_off: number;
  amount_off: number;
  valid: boolean;
};

export const applyDiscount = (price: number, discount: DiscountCoupon) => {
  if (!discount.valid) return price;
  if (discount.amount_off > 0) {
    return price - discount.amount_off;
  }
  if (discount.percent_off > 0) {
    return price - price * (discount.percent_off / 100);
  }
  return price;
};

export const getDiscountTextFn = (
  discount: DiscountCoupon | undefined,
  t: TFunction<"translation", undefined>
) => {
  if (!discount || !discount.valid) return undefined;
  if (discount.amount_off > 0) {
    const amountOff = discount.amount_off.toLocaleString("EN-us", {
      style: "currency",
      currency: "USD",
    });
    switch (discount.duration) {
      case "forever":
        return t("{{0}} off forever", {
          0: amountOff,
        });
      case "once":
        return t("{{0}} off for the first month", {
          0: amountOff,
        });
      case "repeating":
        return t("{{0}} off for {{1}} months", {
          0: amountOff,
          1: discount.duration_in_months,
        });
    }
  }
  if (discount.percent_off > 0) {
    switch (discount.duration) {
      case "forever":
        return t("{{0}}% off forever", {
          0: discount.percent_off,
        });
      case "once":
        return t("{{0}}% off for the first month", {
          0: discount.percent_off,
        });
      case "repeating":
        return t("{{0}}% off for {{1}} months", {
          0: discount.percent_off,
          1: discount.duration_in_months,
        });
    }
  }

  return "";
};

function Subscription() {
  usePageTitle("Manage Billing");
  const { user } = useCuttinboard();
  const { subscriptionDocument, organization, userDocument } = useDashboard();
  const { t } = useTranslation();
  const setupPMFormRef = useRef<SetupPMDialogRef>(null);

  const createManageSubSession = async () => {
    if (!organization) return;

    if (!user.emailVerified) {
      Modal.error({
        title: t("Email not verified"),
        content: t(
          "To manage your subscription, please verify your email first"
        ),
      });
      return;
    }

    const encodeEmail = encodeURIComponent(userDocument.email);

    const uri = `https://billing.stripe.com/p/login/dR615w5MkeoI8cE288?prefilled_email=${encodeEmail}`;

    window.open(uri, "_blank", "noopener,noreferrer");
    // Report to analytics
    logAnalyticsEvent("visit_stripe_portal");
  };

  const getDiscountText = useMemo<string | undefined>(() => {
    const discount: DiscountCoupon | undefined =
      subscriptionDocument?.discount?.coupon;
    return getDiscountTextFn(discount, t);
  }, [subscriptionDocument?.discount?.coupon, t]);

  const getPrice = useMemo(() => {
    const numberOfLocations = Number(organization?.locations);
    const unitPrice =
      Number(subscriptionDocument?.items[0].price.unit_amount) / 100;
    const price = numberOfLocations * unitPrice;
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

  const createManagePaymentIntent = () => {
    if (!user.emailVerified) {
      Modal.error({
        title: t("Email not verified"),
        content: t(
          "Please verify your email before updating your payment method"
        ),
      });
      return;
    }
    setupPMFormRef.current?.openDialog();
  };

  if (!organization) {
    return <Result status="404" title="404" subTitle="Not found" />;
  }

  return (
    <React.Fragment>
      <GrayPageHeader title={t("Manage Billing")} />
      <Space
        direction="vertical"
        align="center"
        style={{ display: "flex", padding: 20 }}
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label={t("Current Plan")}>
            {subscriptionDocument?.items[0].price.product.name}
          </Descriptions.Item>
          <Descriptions.Item label={t("Interval")}>
            {capitalize(
              t(subscriptionDocument?.items[0].price.recurring.interval)
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t("Status")}>
            {t(
              subscriptionDocument?.cancel_at_period_end
                ? t("Scheduled for deletion")
                : capitalize(t(subscriptionDocument?.status))
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t("Locations")}>
            {Number(organization?.locations)}
          </Descriptions.Item>

          <Descriptions.Item label={t("Billing")}>{getPrice}</Descriptions.Item>
          {!subscriptionDocument?.cancel_at_period_end &&
            organization.subscriptionStatus !== "canceled" && (
              <Descriptions.Item label={t("Next Payment")}>
                {dayjs(
                  subscriptionDocument?.current_period_end?.toDate()
                ).format("MM/DD/YYYY")}
              </Descriptions.Item>
            )}
        </Descriptions>

        {getDiscountText && (
          <Alert message={getDiscountText} type="success" showIcon />
        )}

        {organization.subscriptionStatus === "canceled" ? (
          <Alert
            message={t("Your plan was cancelled on {{0}}", {
              0: dayjs(organization.cancellationDate).format("MM/DD/YYYY"),
            })}
            type="error"
            showIcon
          />
        ) : (
          subscriptionDocument?.cancel_at_period_end && (
            <Alert
              message={t(
                "This plan will be cancelled on {{0}}, all your locations will be deleted that day",
                {
                  0: dayjs(subscriptionDocument?.cancel_at?.toDate()).format(
                    "MM/DD/YYYY"
                  ),
                }
              )}
              type="warning"
              showIcon
            />
          )
        )}

        {organization.subscriptionStatus !== "canceled" &&
          (!userDocument.paymentMethods ||
            userDocument.paymentMethods.length < 1) && (
            <React.Fragment>
              <Alert
                message={t("No payment method saved")}
                description={t(
                  "Declare a payment method to keep accessing the Owner plan"
                )}
                type="warning"
                showIcon
                action={
                  <Button
                    color="primary"
                    size="small"
                    type="dashed"
                    icon={<CreditCardTwoTone />}
                    onClick={createManagePaymentIntent}
                  >
                    {t("Add Payment Method")}
                  </Button>
                }
              />
              <SetupPaymentMethodForm ref={setupPMFormRef} />
            </React.Fragment>
          )}

        <Button
          color="primary"
          size="large"
          type="primary"
          icon={<CreditCardTwoTone />}
          onClick={createManageSubSession}
          style={{ marginTop: 10 }}
        >
          {t("Manage Billing")}
        </Button>
      </Space>
    </React.Fragment>
  );
}

export default Subscription;
