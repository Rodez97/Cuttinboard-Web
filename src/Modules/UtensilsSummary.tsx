/** @jsx jsx */
import { IUtensil } from "@cuttinboard-solutions/types-helpers";
import { jsx } from "@emotion/react";
import { Alert, Divider, Skeleton, Space } from "antd/es";
import { useTranslation } from "react-i18next";

export default function UtensilsSummary({
  utensils,
  loading,
}: {
  utensils: IUtensil[];
  loading: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Space
      direction="vertical"
      css={{
        padding: 20,
        flex: 1,
        display: "flex",
      }}
    >
      <Divider orientation="left">{t("Utensils Summary")}</Divider>

      <Skeleton loading={loading}>
        {utensils && utensils.length > 0 ? (
          utensils.map((utensil) => (
            <Alert
              key={utensil.id}
              message={t(
                "“{{0}}” is running low. You currently have {{1}} and the optimal amount is {{2}}",
                {
                  0: utensil.name,
                  1: utensil.currentQuantity,
                  2: utensil.optimalQuantity,
                }
              )}
              type="error"
              showIcon
              className="default-alert"
              css={{
                marginBottom: 5,
              }}
            />
          ))
        ) : (
          <Alert
            message={t("All utensils in acceptable amounts")}
            type="success"
            showIcon
            className="default-alert"
          />
        )}
      </Skeleton>
    </Space>
  );
}
