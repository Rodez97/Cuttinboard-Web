/** @jsx jsx */
import { jsx } from "@emotion/react";
import { doc } from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { httpsCallable } from "firebase/functions";
import { useDocumentData } from "react-firebase-hooks/firestore";
import styled from "@emotion/styled";
import { recordError } from "../utils/utils";
import LiteAvatar from "../assets/images/cuttinboardLite.png";
import PageLoading from "../components/PageLoading";
import PageError from "../components/PageError";
import {
  Firestore,
  Functions,
} from "@cuttinboard/cuttinboard-library/firebase";
import { Button, Checkbox, Layout, List, Space, Typography } from "antd";
import {
  CreditCardOutlined,
  FolderOpenOutlined,
  GiftOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

const PlanCard = styled.div`
  background: #f7f7f7;
  width: 250px;
  height: 250px;
  padding: 5px;
  gap: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: #3d3d3d;
`;

const ProductID = "prod_MINsulkDhsnMys";
const PriceID = "price_1LZn7ACYVoOESVglP6Dtv6xm";

function UpgradeAccount() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [agreeWithTerms, setAgreeWithTerms] = useState(false);
  const [product, loadingProduct, productError] = useDocumentData(
    doc(Firestore, "Products", ProductID)
  );
  const [price, loadingPrice, priceError] = useDocumentData(
    doc(Firestore, "Products", ProductID, "prices", PriceID)
  );

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
      const upgradeAccount = httpsCallable<string, void>(
        Functions,
        "stripe-upgradeOwner"
      );
      await upgradeAccount(PriceID);
      navigate("/dashboard");
    } catch (error) {
      recordError(error);
    }
  };

  if (loadingProduct || loadingPrice) {
    return <PageLoading />;
  }

  if (productError || priceError) {
    return <PageError error={productError ?? priceError} />;
  }

  const features = [
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
  ];

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
      <Typography.Title level={1}>{t("Upgrading to Owner")}</Typography.Title>
      <PlanCard>
        <img src={LiteAvatar} width={100} />

        <Typography.Title level={2}>
          {`$${
            price.interval === "month"
              ? (price.unit_amount / 100).toFixed(2)
              : (price.unit_amount / 100 / 12).toFixed(4).slice(0, 5)
          }`}
        </Typography.Title>

        <Typography.Text type="secondary" css={{ fontSize: 20 }}>
          {t("Per Location")}
        </Typography.Text>
        <Typography.Text type="secondary" css={{ fontSize: 20 }}>
          {t("Per Month")}
        </Typography.Text>
      </PlanCard>

      <List
        css={{ minWidth: 300 }}
        dataSource={features}
        renderItem={({ label, icon }) => (
          <List.Item>
            <List.Item.Meta avatar={icon} title={label} />
          </List.Item>
        )}
      />
      <Checkbox checked={agreeWithTerms} onChange={handleCBChange}>
        {t("I agree with these terms")}
      </Checkbox>
      <Space>
        <Button onClick={handleBack}>{t("Cancel")}</Button>
        <Button
          onClick={handleUpgrade}
          disabled={!agreeWithTerms}
          type="primary"
        >
          {t("Upgrade")}
        </Button>
      </Space>
    </Layout>
  );
}

export default UpgradeAccount;
