import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { httpsCallable } from "firebase/functions";
import { capitalize } from "lodash";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc } from "firebase/firestore";
import PageLoading from "../components/PageLoading";
import PageError from "../components/PageError";
import { recordError } from "../utils/utils";
import { useCuttinboard } from "@cuttinboard/cuttinboard-library/services";
import {
  Firestore,
  Functions,
} from "@cuttinboard/cuttinboard-library/firebase";
import { useDashboard } from "./DashboardProvider";
import { Alert, Button, Descriptions, Space, Typography } from "antd";
import { CreditCardTwoTone } from "@ant-design/icons";

function Subscription() {
  const { user } = useCuttinboard();
  const { subscriptionDocument, organization } = useDashboard();
  const { t } = useTranslation();
  const [isRunning, setIsRunning] = useState(false);
  const [subDoc, loadingSubDoc, subDocError] = useDocumentData(
    doc(Firestore, "Organizations", user.uid)
  );

  const createManageSubSession = async () => {
    setIsRunning(true);
    try {
      const createBillingSession = httpsCallable<
        { return_url: string },
        string
      >(Functions, "stripe-createBillingSession");
      const { data } = await createBillingSession({
        return_url: window.location.href,
      });
      location.assign(data);
    } catch (error) {
      recordError(error);
    }
    setIsRunning(false);
  };

  const getPrice = useMemo(
    () =>
      (
        Number(subDoc?.locations) *
        (Number(subscriptionDocument?.items[0].price.unit_amount) / 100)
      ).toLocaleString("EN-us", {
        style: "currency",
        currency: "USD",
      }),
    [subscriptionDocument, subDoc]
  );

  if (loadingSubDoc) {
    return <PageLoading />;
  }

  if (subDocError) {
    return <PageError error={subDocError} />;
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
          {Number(subDoc?.locations)}
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
        loading={isRunning}
        style={{ marginTop: 10 }}
      >
        {t("Manage Billing")}
      </Button>
    </Space>
  );
}

export default Subscription;
