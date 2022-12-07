import { PlusOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import { Utensil } from "@cuttinboard-solutions/cuttinboard-library/utensils";
import { FIRESTORE } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { collection } from "@firebase/firestore";
import { Button, Empty, Input, Layout, List, Space } from "antd";
import { query, where } from "firebase/firestore";
import { orderBy } from "lodash";
import { matchSorter } from "match-sorter";
import React, { useMemo, useRef, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useTranslation } from "react-i18next";
import { GrayPageHeader, PageLoading } from "../../components";
import ManageUtensilDialog, {
  IManageUtensilDialogRef,
} from "./ManageUtensilDialog";
import UtensilCard from "./UtensilCard";

export default () => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const manageUtensilDialogRef = useRef<IManageUtensilDialogRef>(null);
  const { location, isAdmin, isGeneralManager, isOwner } =
    useCuttinboardLocation();
  const [utensils, loading] = useCollectionData<Utensil>(
    query(
      collection(
        FIRESTORE,
        "Organizations",
        location.organizationId,
        "utensils"
      ),
      where("locationId", "==", location.id)
    ).withConverter(Utensil.firestoreConverter)
  );

  const getUtensils = useMemo(() => {
    if (!utensils) return [];
    const items = searchText
      ? matchSorter(utensils, searchText, { keys: ["name"] })
      : utensils;
    return orderBy(items, "createdAt", "desc");
  }, [searchText, utensils]);

  const handleNewUtensilClick = () => {
    manageUtensilDialogRef.current?.openNew();
  };

  if (loading) {
    return <PageLoading />;
  }

  return (
    <Layout>
      <GrayPageHeader
        title={t("Utensils")}
        extra={[
          <Button
            key="1"
            icon={<PlusOutlined />}
            onClick={handleNewUtensilClick}
            type="primary"
            hidden={!isAdmin && !isGeneralManager && !isOwner}
          >
            {t("Add Utensil")}
          </Button>,
        ]}
      />

      <Space
        align="center"
        wrap
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "5px 20px",
        }}
      >
        <Button
          type="link"
          href="https://www.cuttinboard.com/help/understanding-the-utensils-tool"
          target="_blank"
          icon={<QuestionCircleOutlined />}
        >
          {t("How to use the utensils tool?")}
        </Button>
        <Input.Search
          placeholder={t("Search")}
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
          style={{ width: 200 }}
        />
      </Space>

      <Layout.Content>
        {getUtensils?.length > 0 ? (
          <List
            dataSource={getUtensils}
            renderItem={(utensil, i) => (
              <UtensilCard
                key={i}
                utensil={utensil}
                onClick={(u) => manageUtensilDialogRef.current?.openEdit(u)}
              />
            )}
          />
        ) : (
          <Empty description={t("No utensils have been added yet")} />
        )}
      </Layout.Content>

      <ManageUtensilDialog ref={manageUtensilDialogRef} />
    </Layout>
  );
};
