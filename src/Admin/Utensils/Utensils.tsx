/** @jsx jsx */
import { jsx } from "@emotion/react";
import { PlusOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import {
  useCuttinboardLocation,
  useUtensils,
} from "@cuttinboard-solutions/cuttinboard-library";
import {
  IUtensil,
  RoleAccessLevels,
} from "@cuttinboard-solutions/types-helpers";
import { Button, Input, Layout, List, Space } from "antd/es";
import { useTranslation } from "react-i18next";
import { GrayPageHeader, LoadingPage, SplitButton } from "../../shared";
import { useManageUtensilDialog } from "./ManageUtensilDialog";
import UtensilCard from "./UtensilCard";
import EmptyExtended from "./../../shared/molecules/EmptyExtended";
import NoItems from "../../shared/atoms/NoItems";
import useSorter from "../../hooks/useSorter";
import ErrorPage from "../../shared/molecules/PageError";

export default function Utensils() {
  const { t } = useTranslation();
  const { ManageUtensilDialog, openEdit, openNew } = useManageUtensilDialog();
  const { role } = useCuttinboardLocation();
  const { utensils, loading, error } = useUtensils();
  const {
    order,
    index,
    searchQuery,
    changeIndex,
    changeOrder,
    changeSearchQuery,
    getOrderedItems,
    attributes,
  } = useSorter<IUtensil>({
    attributes: [
      { attr: "createdAt", label: t("Created") },
      { attr: "name", label: t("Name") },
      { attr: "percent", label: t("Percent") },
    ],
    items: utensils,
    queryAttr: ["name"],
    initialState: {
      index: 0,
      order: "asc",
      searchQuery: "",
    },
  });

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPage error={error} />;
  }

  return (
    <Layout>
      <GrayPageHeader
        title={t("Utensils")}
        subTitle={
          <Button
            type="link"
            href="http://www.cuttinboard.com/help/utensils"
            target="_blank"
            icon={<QuestionCircleOutlined />}
          >
            {t("How to use the utensils tool?")}
          </Button>
        }
        extra={[
          <Button
            key="1"
            icon={<PlusOutlined />}
            onClick={openNew}
            type="primary"
            hidden={role > RoleAccessLevels.GENERAL_MANAGER}
          >
            {t("Add Utensil")}
          </Button>,
        ]}
      />

      <Space
        align="center"
        wrap
        css={{
          justifyContent: "space-evenly",
          padding: "10px 5px",
        }}
      >
        <SplitButton
          options={attributes.map((attr) => attr.label)}
          onChange={changeIndex}
          selectedIndex={index}
          order={order}
          onChangeOrder={changeOrder}
        />
        <Input.Search
          placeholder={t("Search")}
          allowClear
          onChange={(e) => changeSearchQuery(e.target.value)}
          value={searchQuery}
          style={{ width: 200 }}
        />
      </Space>

      <Layout.Content>
        <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
          <div
            css={{
              minWidth: 300,
              maxWidth: 800,
              margin: "auto",
              width: "100%",
            }}
          >
            {utensils.length === 0 ? (
              <EmptyExtended
                description={t("No utensils have been added yet")}
                descriptions={[
                  "List the utensils that you use at your restaurant",
                  "Define the optimal amount of utensils that you should have in order to provide good service",
                  "Document when utensils break or are tossed",
                  "Monitor current amount of utensils and determine if new utensils need to be purchased",
                ]}
              />
            ) : getOrderedItems?.length > 0 ? (
              <List
                dataSource={getOrderedItems}
                renderItem={(utensil, i) => (
                  <UtensilCard key={i} utensil={utensil} onClick={openEdit} />
                )}
              />
            ) : (
              <NoItems css={{ marginTop: 50 }} />
            )}
          </div>
        </div>
      </Layout.Content>

      {ManageUtensilDialog}
    </Layout>
  );
}
