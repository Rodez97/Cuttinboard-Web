/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Button, Card, List, message, Modal } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { recordError } from "../../utils/utils";
import { ReactNode, useCallback, useMemo } from "react";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import "./LocationCard.scss";
import { InfoCircleOutlined } from "@ant-design/icons";
import React from "react";
import { logEvent } from "firebase/analytics";
import {
  FUNCTIONS,
  useCuttinboard,
} from "@cuttinboard-solutions/cuttinboard-library";
import { ANALYTICS } from "firebase";
import { ILocation } from "@cuttinboard-solutions/types-helpers";

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
  const [createBillingSession] = useHttpsCallable<
    { return_url: string },
    string
  >(FUNCTIONS, "stripe-createBillingSession");

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
          // Create a billing session
          const billingSessionResponse = await createBillingSession({
            return_url: window.location.href,
          });

          // Check if a response was returned
          if (!billingSessionResponse?.data) {
            throw new Error("No data returned");
          }

          // Report to analytics
          logEvent(ANALYTICS, "billing_session_created", {
            location_id: location.id,
            organization_id: location.organizationId,
            from: "location_card",
            for: "activate_location",
          });

          // Redirect to Stripe Billing Portal
          window.location.assign(billingSessionResponse.data);
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
  }, [createBillingSession, location.id, location.organizationId, t]);

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
