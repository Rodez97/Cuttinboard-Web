/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Location } from "@cuttinboard-solutions/cuttinboard-library/models";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Badge, Button, Card, List, message, Modal } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { recordError } from "../../utils/utils";
import { ReactNode } from "react";
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
    props.deleting
      ? `repeating-linear-gradient(-45deg, #f33d61, #f33d61 10px, #e76e8a 10px, #e76e8a 20px)`
      : props.draftOrEdited &&
        `repeating-linear-gradient(-45deg, #606060, #606060 10px, #505050 10px, #505050 20px)`};
  background-color: ${(props) =>
    !props.draftOrEdited && !props.deleting && "#fff"};
  color: ${(props) => {
    if (props.deleting) {
      return Colors.CalculateContrast("#f33d61");
    }
    if (props.draftOrEdited) {
      return Colors.CalculateContrast("#606060");
    }
    return Colors.CalculateContrast("#ffffff");
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

  const showActionRequired = () => {
    Modal.confirm({
      title: t("Inactive Location"),
      content: t(
        "This location is suspended due to non-payment or failure to renew subscription. Provide a valid payment method in order to activate it."
      ),
      async onOk() {
        try {
          const response = await createBillingSession({
            return_url: window.location.href,
          });
          if (!response?.data) {
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
          window.location.assign(response.data);
        } catch (error) {
          recordError(error);
        }
      },
      type: "error",
      okText: t("Manage Billing"),
      okType: "primary",
    });
  };

  const handleSelectLocation = async () => {
    if (["past_due", "unpaid"].includes(location.subscriptionStatus)) {
      return location.organizationId === user.uid
        ? showActionRequired()
        : message.error(
            t(
              "This location is currently Inactive. Wait for the Location Owner to activate it again."
            )
          );
    }
    if (location.subscriptionStatus === "canceled") {
      return message.error(
        t(
          "El plan vinculado a esta locación ha sido cancelado y tanto la organización como todas sus locaciones serán eliminadas a partir de 15 días pasada la fecha de cancelación!"
        )
      );
    }
    if (!["active", "trialing"].includes(location.subscriptionStatus)) {
      return message.error(
        t("There was an error trying to access this location")
      );
    }
    try {
      navigate(`/l/${location.organizationId}/${location.id}`, {
        replace: true,
      });
    } catch (error) {
      recordError(error);
    }
  };

  const showInfo = () => {
    Modal.info({
      title: location.name,
      content: (
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
    });
  };

  return (
    <Badge
      count={notifications?.getAllBadgesByLocation(
        location.id,
        location.organizationId
      )}
      color="primary"
    >
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
        title={location?.name}
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
