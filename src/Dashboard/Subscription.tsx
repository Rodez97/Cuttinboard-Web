import React, { useMemo } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { capitalize } from "lodash";
import { recordError } from "../utils/utils";
import { useDashboard } from "./DashboardProvider";
import { Alert, Button, Descriptions, Result, Space, Typography } from "antd";
import { CreditCardTwoTone } from "@ant-design/icons";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import { getAnalytics, logEvent } from "firebase/analytics";
import { FUNCTIONS } from "@cuttinboard-solutions/cuttinboard-library/utils";

function Subscription() {
  const { subscriptionDocument, organization, userDocument } = useDashboard();
  const { t } = useTranslation();
  const [createBillingSession, running, error] = useHttpsCallable<
    string,
    string
  >(FUNCTIONS, "stripe-createBillingSession");

  const createManageSubSession = async () => {
    if (!organization) return;
    try {
      const result = await createBillingSession(window.location.href);
      if (!result?.data) {
        throw new Error("No data returned");
      }
      // Report to analytics
      logEvent(getAnalytics(), "manage_subscription", {
        method: "stripe",
        organization: organization.subscriptionId,
        uid: userDocument.id,
      });
      // Redirect to Stripe
      location.assign(result.data);
    } catch (error) {
      recordError(error);
    }
  };

  const getPrice = useMemo(
    () =>
      (
        Number(organization?.locations) *
        (Number(subscriptionDocument?.items[0].price.unit_amount) / 100)
      ).toLocaleString("EN-us", {
        style: "currency",
        currency: "USD",
      }),
    [subscriptionDocument, organization]
  );

  if (!organization) {
    return <Result status="404" title="404" subTitle="Not found" />;
  }

  return (
    <Space
      direction="vertical"
      align="center"
      style={{ display: "flex", padding: 20 }}
    >
      <Typography.Title>{t("Manage Billing")}</Typography.Title>
      <Typography.Title level={5} type="secondary">
        {t("Manage your subscription and plan details")}
      </Typography.Title>

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
              {dayjs(subscriptionDocument?.current_period_end?.toDate()).format(
                "MM/DD/YYYY"
              )}
            </Descriptions.Item>
          )}
      </Descriptions>

      {}

      {organization.subscriptionStatus === "canceled" ? (
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
      ) : (
        subscriptionDocument?.cancel_at_period_end && (
          <Alert
            message={t(
              "This plan will be cancelled on {{0}}, all your locations will be deleted 15 days after the cancellation.",
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
          <Alert
            message={t(
              "No payment method saved. Declare a payment method to keep accessing the Owner plan."
            )}
            type="warning"
            showIcon
          />
        )}

      <Button
        color="primary"
        size="large"
        type="primary"
        icon={<CreditCardTwoTone />}
        onClick={createManageSubSession}
        loading={running}
        style={{ marginTop: 10 }}
      >
        {t("Manage Billing")}
      </Button>

      {error && <Alert message={t(error.message)} type="error" showIcon />}
    </Space>
  );
}

export default Subscription;
