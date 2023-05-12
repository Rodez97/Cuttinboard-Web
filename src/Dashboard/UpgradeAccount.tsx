/** @jsx jsx */
import { jsx } from "@emotion/react";
import { doc } from "firebase/firestore";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDocumentData } from "react-firebase-hooks/firestore";
import styled from "@emotion/styled";
import { recordError } from "../utils/utils";
import LiteAvatar from "../assets/images/cuttinboardLite.png";
import {
  Alert,
  Button,
  Checkbox,
  Layout,
  List,
  Result,
  Typography,
} from "antd";
import {
  CreditCardOutlined,
  FolderOpenOutlined,
  GiftOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { logEvent } from "firebase/analytics";
import { PageError, LoadingPage } from "../shared";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import {
  FIRESTORE,
  FUNCTIONS,
  useCuttinboard,
} from "@cuttinboard-solutions/cuttinboard-library";
import { httpsCallable } from "firebase/functions";
import { ANALYTICS } from "firebase";

const PlanCard = styled.div`
  background: #f7f7f7;
  width: 250px;
  height: 250px;
  padding: 5px;
  gap: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: #3d3d3d;
  margin: auto;
`;

export default () => {
  const { user } = useCuttinboard();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [agreeWithTerms, setAgreeWithTerms] = useState(false);
  const [price, loadingPrice, priceError] = useDocumentData(
    doc(
      FIRESTORE,
      "Products",
      process.env.STRIPE_PRODUCT_ID,
      "prices",
      process.env.STRIPE_PRICE_ID
    )
  );
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (agreeWithTerms) {
      await upgradeToBusiness();
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleCBChange = (event: CheckboxChangeEvent) => {
    setAgreeWithTerms(event.target.checked);
  };

  const upgradeToBusiness = async () => {
    try {
      setIsLoading(true);
      const upgradeAccount = httpsCallable<undefined, void>(
        FUNCTIONS,
        "stripe-upgradeowner"
      );
      await upgradeAccount();
      // Report to analytics
      logEvent(ANALYTICS, "upgrade_account", {
        method: "stripe",
        uid: user.uid,
      });
      // REdirect to dashboard
      navigate("/dashboard/owner-portal");
    } catch (error) {
      recordError(error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = useMemo(
    () => [
      {
        label: t("Enjoy your first month for free."),
        icon: <GiftOutlined css={{ color: "#10AFDC" }} />,
      },
      {
        label: t("No credit card required."),
        icon: <CreditCardOutlined css={{ color: "#10AFDC" }} />,
      },
      {
        label: t("Up to 100 employees per Location."),
        icon: <TeamOutlined css={{ color: "#10AFDC" }} />,
      },
      {
        label: t("5 GB file storage per Location."),
        icon: <FolderOpenOutlined css={{ color: "#10AFDC" }} />,
      },
    ],
    [t]
  );

  if (loadingPrice) {
    return <LoadingPage />;
  }

  if (priceError) {
    return <PageError error={priceError} />;
  }

  if (!price) {
    return <Result status="404" title="404" subTitle="Not found" />;
  }

  return (
    <Layout
      css={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 20,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        css={{ minWidth: 270, maxWidth: 400, margin: "auto", width: "100%" }}
      >
        <Typography.Title level={1} css={{ textAlign: "center" }}>
          {t("Upgrading to Owner")}
        </Typography.Title>
        <PlanCard>
          <img src={LiteAvatar} width={100} />

          <Typography.Text strong css={{ fontSize: 25 }}>
            {`$${
              price.interval === "month"
                ? (price.unit_amount / 100).toFixed(2)
                : (price.unit_amount / 100 / 12).toFixed(4).slice(0, 5)
            }`}
          </Typography.Text>

          <Typography.Text type="secondary" css={{ fontSize: 20 }}>
            {t("Per Location")}
          </Typography.Text>
          <Typography.Text type="secondary" css={{ fontSize: 18 }}>
            {t("Per Month")}
          </Typography.Text>
        </PlanCard>

        <List
          css={{
            minWidth: 270,
            maxWidth: 400,
            margin: "auto",
            width: "100%",
            marginTop: 16,
          }}
          bordered={false}
          split={false}
          size="small"
          dataSource={features}
          renderItem={({ label, icon }, i) => (
            <List.Item key={i}>
              <List.Item.Meta avatar={icon} title={label} />
            </List.Item>
          )}
        />
        <Checkbox
          checked={agreeWithTerms}
          onChange={handleCBChange}
          disabled={isLoading}
          css={{ marginTop: 16, display: "flex", justifyContent: "center" }}
        >
          {t("I agree with these terms")}
        </Checkbox>
        <Button.Group
          css={{ marginTop: 16, display: "flex", justifyContent: "center" }}
        >
          <Button onClick={handleBack} disabled={isLoading}>
            {t("Cancel")}
          </Button>
          <Button
            onClick={handleUpgrade}
            disabled={!agreeWithTerms}
            loading={isLoading}
            type="primary"
          >
            {t("Upgrade")}
          </Button>
          {error && <Alert message={t(error.message)} type="error" showIcon />}
        </Button.Group>
      </div>
    </Layout>
  );
};
