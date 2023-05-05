import React, { useMemo, useRef } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { capitalize } from "lodash";
import { useDashboard } from "./DashboardProvider";
import { Alert, Button, Descriptions, Modal, Result, Space } from "antd";
import { CreditCardTwoTone } from "@ant-design/icons";
import usePageTitle from "../hooks/usePageTitle";
import SetupPaymentMethodForm, {
  SetupPMDialogRef,
} from "./SetupPaymentMethodForm";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library";
import { GrayPageHeader } from "../shared";

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

        {}

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
            <>
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
            </>
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
