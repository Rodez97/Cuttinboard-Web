/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Location } from "@cuttinboard-solutions/cuttinboard-library/models";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Badge, Button, Card, List, message, Modal } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { recordError } from "../../utils/utils";
import { ReactNode, useCallback, useMemo } from "react";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import styled from "@emotion/styled";
import {
  Colors,
  FUNCTIONS,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import "./LocationCard.scss";
import { InfoCircleOutlined } from "@ant-design/icons";
import React from "react";
import { getAnalytics, logEvent } from "firebase/analytics";

const { Meta } = Card;

const MainCard = styled(Card)<{
  draftOrEdited?: boolean;
  deleting: boolean;
  haveActions?: boolean;
}>`
  cursor: pointer;
  width: 270px;
  height: ${(props) => (props.haveActions ? 170 : 120)};
  background: ${(props) =>
    props.deleting &&
    `repeating-linear-gradient(-45deg, #f33d61, #f33d61 10px, #e76e8a 10px, #e76e8a 20px)`};
  background-color: ${(props) => !props.deleting && "#fff"};
  color: ${(props) => {
    if (props.deleting) {
      return Colors.CalculateContrast("#f33d61");
    } else {
      return Colors.CalculateContrast("#fff");
    }
  }} !important;
`;

interface LocationCardProps {
  location: Location;
  actions?: ReactNode[];
}

export default ({ location, actions }: LocationCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, notifications } = useCuttinboard();
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
        "This location is suspended due to non-payment or failure to renew subscription. Provide a valid payment method in order to activate it."
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
          const analytics = getAnalytics();
          logEvent(analytics, "billing_session_created", {
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
          "This location is currently Inactive. Wait for the Location Owner to activate it again."
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
            ["Description", "description"],
            ["Phone", "phoneNumber"],
            ["Email", "email"],
            ["City", "address.city"],
            ["State", "address.state"],
            ["Country", "address.country"],
            ["Zip Code", "address.zip"],
            ["ID", "intId"],
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

  const badges = useMemo(
    () =>
      notifications?.getAllBadgesByLocation(
        location.id,
        location.organizationId
      ),
    [location, notifications]
  );

  return (
    <Badge count={badges} color="primary">
      <MainCard
        hoverable
        onClick={handleSelectLocation}
        actions={actions}
        haveActions={Boolean(actions?.length)}
        deleting={Boolean(location.subscriptionStatus === "canceled")}
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
      >
        <Meta
          css={{ color: "inherit" }}
          description={`${
            location.members ? location.members.length : 0
          } Member(s)`}
        />
      </MainCard>
    </Badge>
  );
};
