/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import styled from "@emotion/styled";
import { useAddLocation } from "../AddLocation";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc } from "firebase/firestore";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Firestore } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { useDashboard } from "../../../DashboardProvider";
import { List, Space, Typography } from "antd";
import { ShopOutlined, UserOutlined } from "@ant-design/icons";
import { PageError, PageLoading } from "../../../../components";

const SummaryNewLocationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-radius: 5px;
  padding: 10px;
  box-shadow: inset 0px 1px 0px rgba(255, 255, 255, 0.8),
    0px 1px 3px rgba(0, 0, 0, 0.3);
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    from(#000000),
    to(#434343)
  );
  color: #fff !important;
  & .ant-list-item-meta-title {
    color: #fff;
  }
  & .ant-list-item-meta-description {
    color: #ffffff80;
  }
  & .ant-typography {
    color: #fff;
    text-align: center;
  }
  & .ant-typography-secondary {
    color: #ffffff80;
  }
`;

function FinalStep() {
  const { t } = useTranslation();
  const { user } = useCuttinboard();
  const { subscriptionDocument } = useDashboard();
  const { location, generalManager } = useAddLocation();
  const [subDoc, loadingSubDoc, subDocError] = useDocumentData(
    doc(Firestore, "Organizations", user.uid)
  );

  const getPrice = useCallback(() => {
    const price = subscriptionDocument?.items[0]?.price.unit_amount / 100;
    const newQuantity = Number(subDoc?.locations) + 1;
    return price * newQuantity;
  }, [subscriptionDocument, subDoc]);

  const getPriceText = useCallback(() => {
    const price = subscriptionDocument?.items[0]?.price.unit_amount / 100;
    const newQuantity = Number(subDoc?.locations) + 1;
    return t(`{{0}} locations x {{1}}`, {
      0: newQuantity,
      1: price.toLocaleString("EN-us", {
        style: "currency",
        currency: "USD",
      }),
    });
  }, [subscriptionDocument, subDoc]);

  if (loadingSubDoc) {
    return <PageLoading />;
  }

  if (subDocError) {
    return <PageError error={subDocError} />;
  }

  return (
    <div
      css={{
        display: "flex",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <SummaryNewLocationContainer>
        <Typography.Title level={4}>
          {t("A new location will be added")}
        </Typography.Title>

        <Space
          css={{ border: "1px solid #ffffff80", padding: 5 }}
          size="large"
          direction="vertical"
        >
          <List.Item.Meta
            avatar={<ShopOutlined />}
            title={t("Name")}
            description={location.name}
          />
          {generalManager && (
            <List.Item.Meta
              avatar={<UserOutlined />}
              title={t("General Manager")}
              description={generalManager.name}
            />
          )}
        </Space>

        <Typography.Title level={5}>
          {t("Your new bill will be:")}
        </Typography.Title>
        <Typography.Title level={2}>
          {getPrice().toLocaleString("EN-us", {
            style: "currency",
            currency: "USD",
          })}
          <Typography.Text type="secondary">{t("/month")}</Typography.Text>
        </Typography.Title>
        <Typography.Title level={5}>{getPriceText()}</Typography.Title>
      </SummaryNewLocationContainer>
    </div>
  );
}

export default FinalStep;
