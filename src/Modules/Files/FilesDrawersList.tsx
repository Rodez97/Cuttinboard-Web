/** @jsx jsx */
import { jsx } from "@emotion/react";
import { ContainerOutlined, PlusOutlined } from "@ant-design/icons";
import {
  useCuttinboardModule,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  Colors,
  RoleAccessLevels,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Button, Input, Menu, Space } from "antd";
import { orderBy } from "lodash";
import { matchSorter } from "match-sorter";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import FilesCounter from "./FilesCounter";
import { DarkPageHeader } from "../../components/PageHeaders";

function FilesDrawersList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedApp, elements } = useCuttinboardModule();
  const { locationAccessKey, location } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const menuItems = useMemo(() => {
    const sorted = matchSorter(elements, searchQuery, { keys: ["name"] });
    return orderBy(sorted, "createdAt", "desc")?.map((el) => ({
      label: el.name,
      value: el.id,
      icon: <ContainerOutlined />,
      key: el.id,
    }));
  }, [elements, searchQuery]);

  return (
    <Space
      direction="vertical"
      css={{
        display: "flex",
        padding: "3px 5px",
        borderTop: `5px solid ${Colors.MainBlue}`,
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Space direction="vertical" css={{ display: "flex" }}>
        <DarkPageHeader
          title={t("Files")}
          onBack={() => navigate(`/location/${location.id}/apps`)}
          css={{ paddingBottom: 0, paddingTop: 0 }}
        />
        {locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER && (
          <Button
            icon={<PlusOutlined />}
            block
            type="dashed"
            onClick={() => navigate("new")}
          >
            {t("Add")}
          </Button>
        )}
        <Input.Search
          placeholder={t("Search")}
          value={searchQuery}
          onChange={({ currentTarget: { value } }) => setSearchQuery(value)}
        />
        <Menu
          theme="dark"
          items={menuItems}
          onSelect={({ key }) => navigate(key)}
          selectedKeys={[selectedApp?.id]}
        />
      </Space>

      <FilesCounter />
    </Space>
  );
}

export default FilesDrawersList;
