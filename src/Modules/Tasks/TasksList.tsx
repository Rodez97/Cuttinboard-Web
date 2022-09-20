/** @jsx jsx */
import { jsx } from "@emotion/react";
import { OrderedListOutlined, PlusOutlined } from "@ant-design/icons";
import {
  useCuttinboardModule,
  useLocation,
} from "@cuttinboard/cuttinboard-library/services";
import {
  Colors,
  RoleAccessLevels,
} from "@cuttinboard/cuttinboard-library/utils";
import { Button, Input, Menu, Space } from "antd";
import { orderBy } from "lodash";
import { matchSorter } from "match-sorter";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { DarkPageHeader } from "../../components/PageHeaders";

function TasksList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedApp, elements } = useCuttinboardModule();
  const { locationAccessKey, locationId } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const menuItems = useMemo(() => {
    const sorted = matchSorter(elements, searchQuery, { keys: ["name"] });
    return orderBy(sorted, "createdAt", "desc")?.map((el) => ({
      label: el.name,
      value: el.id,
      icon: <OrderedListOutlined />,
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
      }}
    >
      <DarkPageHeader
        title={t("Tasks")}
        onBack={() => navigate(`/location/${locationId}/apps`)}
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
  );
}

export default TasksList;
