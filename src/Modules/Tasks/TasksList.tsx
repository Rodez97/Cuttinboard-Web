/** @jsx jsx */
import { jsx } from "@emotion/react";
import { OrderedListOutlined, PlusOutlined } from "@ant-design/icons";
import {
  useCuttinboardModule,
  useLocation,
  useNotificationsBadges,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  Colors,
  RoleAccessLevels,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Badge, Button, Input, Menu, MenuProps, Space } from "antd";
import { orderBy } from "lodash";
import { matchSorter } from "match-sorter";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { DarkPageHeader } from "../../components/PageHeaders";
import { useNewElement } from "../../hooks/useNewElement";
import ManageModuleDialog, {
  useManageModule,
} from "../ManageApp/ManageModuleDialog";

function TasksList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const newElement = useNewElement();
  const { selectedApp, elements } = useCuttinboardModule();
  const { locationAccessKey } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { getModuleBadge } = useNotificationsBadges();
  const { baseRef, newModule } = useManageModule();

  const menuItems = useMemo((): MenuProps["items"] => {
    const sorted = matchSorter(elements, searchQuery, { keys: ["name"] });

    return orderBy(sorted, "createdAt", "desc")?.map((el) => ({
      label: (
        <Badge
          count={getModuleBadge("task", el.id)}
          size="small"
          css={{ color: "inherit" }}
          offset={[10, 0]}
        >
          <p>{el.name}</p>
        </Badge>
      ),
      value: el.id,
      icon: <OrderedListOutlined />,
      key: el.id,
      onClick: () => navigate(el.id, { replace: true }),
    }));
  }, [elements, searchQuery]);

  return (
    <Space
      direction="vertical"
      css={{
        display: "flex",
        borderTop: `5px solid ${Colors.MainBlue}`,
      }}
    >
      <Space
        direction="vertical"
        css={{
          padding: "3px 5px",
          display: "flex",
        }}
      >
        <DarkPageHeader
          title={t("Tasks")}
          onBack={() => navigate(-1)}
          css={{ paddingBottom: 0, paddingTop: 0 }}
        />
        {locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER && (
          <Button
            icon={<PlusOutlined />}
            block
            type="dashed"
            onClick={newModule}
          >
            {t("Add")}
          </Button>
        )}
        <Input.Search
          placeholder={t("Search")}
          value={searchQuery}
          onChange={({ currentTarget: { value } }) => setSearchQuery(value)}
        />
      </Space>
      <Menu theme="dark" items={menuItems} selectedKeys={[selectedApp?.id]} />
      <ManageModuleDialog ref={baseRef} moduleName="Tasks Board" />
    </Space>
  );
}

export default TasksList;
