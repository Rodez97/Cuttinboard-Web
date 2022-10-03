import { PlusOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Firestore } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import {
  ModuleFirestoreConverter,
  Utensil,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import { useLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import { collection } from "@firebase/firestore";
import { Button, Empty, Input, Layout, List, PageHeader, Space } from "antd";
import { orderBy } from "lodash";
import React, { useMemo, useRef, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PageLoading from "../../components/PageLoading";
import ManageUtensilDialog, {
  IManageUtensilDialogRef,
} from "./ManageUtensilDialog";
import UtensilCard from "./UtensilCard";

const UtensilConverter = ModuleFirestoreConverter<Utensil>();

function Utensils() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const manageUtensilDialogRef = useRef<IManageUtensilDialogRef>(null);
  const { location } = useLocation();

  const [utensils, loading] = useCollectionData<Utensil>(
    collection(Firestore, location.docRef.path, "utensils").withConverter(
      UtensilConverter
    )
  );

  const handleBack = () => {
    navigate(-1);
  };

  const getUtensils = useMemo(() => {
    const items =
      searchText && utensils
        ? utensils.filter((u) =>
            u.name.toLowerCase().includes(searchText.toLowerCase())
          )
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
      <PageHeader
        className="site-page-header-responsive"
        onBack={handleBack}
        title={t("Utensils")}
        extra={[
          <Button
            key="1"
            icon={<PlusOutlined />}
            onClick={handleNewUtensilClick}
            type="primary"
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
          onSearch={setSearchText}
          value={searchText}
          style={{ width: 200 }}
        />
      </Space>

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

      <ManageUtensilDialog ref={manageUtensilDialogRef} />
    </Layout>
  );
}

export default Utensils;
