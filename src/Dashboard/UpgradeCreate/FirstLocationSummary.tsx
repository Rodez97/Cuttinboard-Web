/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "antd/es";
import { FolderOpenOutlined, TeamOutlined } from "@ant-design/icons";
import { DocumentData } from "firebase/firestore";

function FirstLocationSummary({ price }: { price: DocumentData }) {
  const { t } = useTranslation();

  const priceNumber = useMemo(() => {
    if (!price) return 0;

    const parsedPrice = parseFloat(
      price.interval === "month"
        ? (price.unit_amount / 100).toFixed(2)
        : (price.unit_amount / 100 / 12).toFixed(4).slice(0, 5)
    );

    return parsedPrice;
  }, [price]);

  return (
    <div
      css={{
        marginLeft: "1rem",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography.Text
        type="secondary"
        css={{
          fontSize: "1.1rem",
          margin: "0.2rem 0",
          maxWidth: "750px",
        }}
      >
        {t(
          "Experience Cuttinboard with a risk-free {{0}}-day trial, no credit card needed! Once the trial ends, you'll be billed at {{1}} per location per month for uninterrupted access to our service",
          {
            0: 30,
            1: priceNumber.toLocaleString("EN-us", {
              style: "currency",
              currency: "USD",
            }),
          }
        )}
      </Typography.Text>

      <div
        css={{
          display: "flex",
          flexDirection: "row",
          alignItems: "baseline",
          gap: 10,
          marginTop: 10,
          marginBottom: 10,
        }}
      >
        <TeamOutlined css={{ color: "#10AFDC" }} />
        <Typography.Text type="secondary">
          {t("Up to {{0}} employees per Location", {
            0: 100,
          })}
        </Typography.Text>
      </div>

      <div
        css={{
          display: "flex",
          flexDirection: "row",
          alignItems: "baseline",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <FolderOpenOutlined css={{ color: "#10AFDC" }} />
        <Typography.Text type="secondary">
          {t("{{0}} GB file storage per Location", { 0: 5 })}
        </Typography.Text>
      </div>

      <Typography.Text
        type="secondary"
        css={{
          marginBottom: 10,
        }}
      >
        {t("By creating your first location, you agree to our")}{" "}
        <a
          href="https://www.cuttinboard.com/legal/terms-of-service"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("Terms of Service")}
        </a>{" "}
        {t("and")}{" "}
        <a
          href="https://www.cuttinboard.com/legal/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("Privacy Policy")}
        </a>
      </Typography.Text>
      <div
        css={{
          display: "flex",
          flexDirection: "row",
        }}
      ></div>
    </div>
  );
}

export default FirstLocationSummary;
