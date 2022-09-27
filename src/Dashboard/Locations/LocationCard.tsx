/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Location } from "@cuttinboard-solutions/cuttinboard-library/models";
import {
  useCuttinboard,
  useNotificationsBadges,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { Badge, Card, message, Modal, Spin, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useSelectedLocation from "../../hooks/useSelectedLocation";
import { recordError } from "../../utils/utils";
import { ReactNode, useState } from "react";
import { useHttpsCallable } from "react-firebase-hooks/functions";
import { Functions } from "@cuttinboard-solutions/cuttinboard-library/firebase";

const { Meta } = Card;

interface LocationCardProps {
  location: Location;
  actions?: ReactNode[];
}

function LocationCard({ location, actions }: LocationCardProps) {
  const navigate = useNavigate();
  const { selectLocation: selectLocId } = useSelectedLocation();
  const { getBadgeByLocation } = useNotificationsBadges();
  const { t } = useTranslation();
  const { user, selectLocation } = useCuttinboard();
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [createBillingSession, isRunning, error] = useHttpsCallable<
    { return_url: string },
    string
  >(Functions, "stripe-createBillingSession");

  const showActionRequired = () => {
    Modal.confirm({
      title: t("Inactive Location"),
      content: t(
        "This location is suspended due to non-payment or failure to renew subscription. Provide a valid payment method in order to activate it."
      ),
      async onOk() {
        try {
          const { data } = await createBillingSession({
            return_url: window.location.href,
          });
          window.location.assign(data);
        } catch {
          recordError(error);
        }
      },
      onCancel() {},
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
    setLoadingLocation(true);
    try {
      selectLocId(location.id);
      await selectLocation(location);
      navigate(`/location/${location.id}`);
    } catch (error) {
      recordError(error);
    }
    setLoadingLocation(false);
  };

  console.log({
    xyz: getBadgeByLocation(location.id, location.organizationId),
  });

  return (
    <Badge
      count={getBadgeByLocation(location.id, location.organizationId)}
      color="primary"
    >
      <Spin spinning={loadingLocation || isRunning}>
        <Card
          css={{
            width: 270,
            height: Boolean(actions?.length) ? 170 : 120,
          }}
          hoverable
          onClick={handleSelectLocation}
          actions={actions}
        >
          <Meta
            title={
              <Typography.Paragraph
                ellipsis={{ rows: 2, expandable: false, symbol: "..." }}
              >
                {location?.name}
              </Typography.Paragraph>
            }
            description={`${
              location.members ? location.members.length : 0
            } Member(s)`}
          />
        </Card>
      </Spin>
    </Badge>
  );
}

export default LocationCard;
