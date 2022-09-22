import React, { useMemo } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { capitalize } from "lodash";
import { recordError } from "../utils/utils";
import { Functions } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { useDashboard } from "./DashboardProvider";
import { Alert, Button, Descriptions, Space, Typography } from "antd";
import { CreditCardTwoTone } from "@ant-design/icons";
import { useHttpsCallable } from "react-firebase-hooks/functions";

function Subscription() {
  const { subscriptionDocument, organization } = useDashboard();
  const { t } = useTranslation();
  const [createBillingSession, running, error] = useHttpsCallable<
    string,
    string
  >(Functions, "stripe-createBillingSession");

  const createManageSubSession = async () => {
    try {
      const { data } = await createBillingSession(window.location.href);
      location.assign(data);
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

      {subscriptionDocument?.cancel_at_period_end && (
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
      )}

      {organization.subscriptionStatus !== "canceled" &&
        !subscriptionDocument?.default_payment_method && (
          <Alert
            message={t(
              "No payment method saved. Declare a payment method to keep accessing the Owner plan."
            )}
            type="warning"
            showIcon
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
