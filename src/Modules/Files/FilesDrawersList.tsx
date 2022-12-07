/** @jsx jsx */
import { jsx } from "@emotion/react";
import { ContainerOutlined, PlusOutlined } from "@ant-design/icons";
import { RoleAccessLevels } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Button, Input, Menu, MenuProps, Space } from "antd";
import { orderBy } from "lodash";
import { matchSorter } from "match-sorter";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import FilesCounter from "./FilesCounter";
import ManageModuleDialog, {
  useManageModule,
} from "../ManageApp/ManageModuleDialog";
import { useBoard } from "@cuttinboard-solutions/cuttinboard-library/boards";
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library/services";

export default () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedBoard, boards } = useBoard();
  const { locationAccessKey } = useCuttinboardLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { baseRef, newModule } = useManageModule();

  const menuItems = useMemo((): MenuProps["items"] => {
    const sorted = boards
      ? matchSorter(boards, searchQuery, { keys: ["name"] })
      : [];

    return orderBy(sorted, "createdAt", "desc")?.map((el) => ({
      label: el.name,
      value: el.id,
      icon: <ContainerOutlined />,
      key: el.id,
      onClick: () => navigate(el.id, { replace: true }),
    }));
  }, [boards, navigate, searchQuery]);

  return (
    <Space
      direction="vertical"
      className="module-sider-container"
      css={{
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <Space direction="vertical" css={{ display: "flex" }}>
        <Space direction="vertical" className="module-sider-content">
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
        <Menu
          items={menuItems}
          selectedKeys={selectedBoard ? [selectedBoard.id] : []}
          className="module-sider-menu"
        />

        <ManageModuleDialog ref={baseRef} moduleName="Drawer" />
      </Space>

      <FilesCounter />
    </Space>
  );
};
