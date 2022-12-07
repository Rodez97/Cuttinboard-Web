/** @jsx jsx */
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Utensil } from "@cuttinboard-solutions/cuttinboard-library/utensils";
import { FIRESTORE } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { jsx } from "@emotion/react";
import { Alert, Divider, Skeleton, Space } from "antd";
import { collection, query, where } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default () => {
  const { t } = useTranslation();
  const { location } = useCuttinboardLocation();
  const [utensils, loading, error] = useCollectionData<Utensil>(
    query(
      collection(
        FIRESTORE,
        "Organizations",
        location.organizationId,
        "utensils"
      ),
      where("locationId", "==", location.id),
      where("percent", "<=", 33.33)
    ).withConverter(Utensil.firestoreConverter)
  );
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
                "“{{name}}” is running low. You currently have {{currentQuantity}} and the optimal amount is {{optimalQuantity}}",
                {
                  name: utensil.name,
                  currentQuantity: utensil.currentQuantity,
                  optimalQuantity: utensil.optimalQuantity,
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
            description={
              <Link to="../utensils" replace>
                {t("Take me to utensils")}
              </Link>
            }
            type="success"
            showIcon
            className="default-alert"
          />
        )}
      </Skeleton>

      {error && <Alert message={error.message} type="error" showIcon />}
    </Space>
  );
};
