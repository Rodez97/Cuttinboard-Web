/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Button, Card, List, message, Modal } from "antd/es";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { recordError } from "../../utils/utils";
import { ReactNode, useCallback, useMemo } from "react";
import "./LocationCard.scss";
import { InfoCircleOutlined } from "@ant-design/icons";
import React from "react";
import { useCuttinboard } from "@rodez97/cuttinboard-library";
import { ILocation } from "@rodez97/types-helpers";
import { logAnalyticsEvent } from "../../utils/analyticsHelpers";

const { Meta } = Card;

interface LocationCardProps {
  location: ILocation;
  actions?: ReactNode[];
  showBadge?: boolean;
}

export default ({ location, actions }: LocationCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useCuttinboard();

  // Define a function that shows a billing modal
  const showBillingModal = useCallback(() => {
    // Show a modal to confirm that the user wants to manage their billing
    Modal.confirm({
      title: t("Inactive Location"),
      content: t(
        "This location is suspended due to non-payment or failure to renew subscription. Provide a valid payment method in order to activate it"
      ),
      // When the user confirms the modal, create a billing session and redirect
      // to the Stripe billing portal
      async onOk() {
        try {
          if (!user.email || !user.emailVerified) {
            Modal.error({
              title: t("Email not verified"),
              content: t(
                "To manage your subscription, please verify your email first"
              ),
            });
            return;
          }
          const encodeEmail = encodeURIComponent(user.email);

          const uri = `https://billing.stripe.com/p/login/dR615w5MkeoI8cE288?prefilled_email=${encodeEmail}`;

          window.open(uri, "_blank", "noopener,noreferrer");
          // Report to analytics
          logAnalyticsEvent("visit_stripe_portal");
        } catch (error) {
          // Handle any errors that occur
          recordError(error);
        }
      },
      // Set the modal type to "error"
      type: "error",
      // Set the text and type of the "OK" button
      okText: t("Manage Billing"),
      okType: "primary",
    });
  }, [t, user.email, user.emailVerified]);

  const handleSelectLocation = useCallback(async () => {
    // Destructure properties from the location object
    const { subscriptionStatus, organizationId, id } = location;

    // Check if subscription status is "past_due" or "unpaid"
    if (["past_due", "unpaid"].includes(subscriptionStatus)) {
      // If the current user is the location owner, show action required message
      if (organizationId === user.uid) {
        return showBillingModal();
      }

      // Otherwise, show error message
      return message.error(
        t(
          "This location is currently Inactive. Wait for the Location Owner to activate it again"
        )
      );
    }

    // Check if subscription status is "canceled"
    if (subscriptionStatus === "canceled") {
      // If so, show error message
      return message.error(
        t(
          "The plan linked to this location has been canceled and both the organization and all its locations will be eliminated starting 15 days after the cancellation date!"
        )
      );
    }

    // Check if subscription status is "active" or "trialing"
    if (!["active", "trialing"].includes(subscriptionStatus)) {
      // If not, show error message
      return message.error(
        t("There was an error trying to access this location")
      );
    }

    // Otherwise, navigate to the location page
    try {
      navigate(`/l/${organizationId}/${id}`, {
        replace: true,
      });
    } catch (error) {
      // If an error occurs, record it
      recordError(error);
    }
  }, [location, navigate, showBillingModal, t, user.uid]);

  const content = useMemo(
    () => (
      <React.Fragment>
        <List
          size="small"
          dataSource={[
            ["Name", "name"],
            ["ID", "intId"],
            ["City", "address.city"],
            ["State", "address.state"],
            ["Zip Code", "address.zip"],
          ]}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                title={t(item[0])}
                description={item[1]
                  .split(".")
                  .reduce((o, i) => o[i] ?? "---", location)}
              />
            </List.Item>
          )}
        />
      </React.Fragment>
    ),
    [location, t]
  );

  const showInfo = useCallback(
    () =>
      Modal.info({
        title: location.name,
        content,
      }),
    [content, location.name]
  );

  return (
    <Card
      hoverable
      onClick={handleSelectLocation}
      actions={actions}
      extra={
        <Button
          type="text"
          shape="circle"
          icon={<InfoCircleOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            showInfo();
          }}
        />
      }
      title={location.name}
      className={`card-base ${Boolean(actions?.length) && "card-actions"} ${
        Boolean(location.subscriptionStatus === "canceled") && "card-deleting"
      }`}
    >
      <Meta
        css={{ color: "inherit" }}
        description={t(`{{0}} Member(s)`, {
          0: location.members ? location.members.length : 0,
        })}
      />
    </Card>
  );
};
