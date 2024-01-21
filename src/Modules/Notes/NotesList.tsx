/** @jsx jsx */
import { jsx } from "@emotion/react";
import Icon, { GlobalOutlined, PlusOutlined } from "@ant-design/icons";
import { useBoard, useCuttinboardLocation } from "@rodez97/cuttinboard-library";
import { Button, Input, Menu, MenuProps, Spin } from "antd/es";
import orderBy from "lodash-es/orderBy";
import { matchSorter } from "match-sorter";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { NoteIcon } from "./notesIcons";
import ManageModuleDialog, {
  useManageModule,
} from "../ManageApp/ManageModuleDialog";
import { RoleAccessLevels } from "@rodez97/types-helpers";
import { useDrawerSiderContext } from "../../shared/organisms/useDrawerSider";

export default () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedBoard, boards, loading, error } = useBoard();
  const { role } = useCuttinboardLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { baseRef, newModule } = useManageModule();
  const { setDrawerOpen } = useDrawerSiderContext();

  const menuItems = useMemo((): MenuProps["items"] => {
    if (!boards) return [];

    const sorted = searchQuery
      ? matchSorter(boards, searchQuery, { keys: ["name"] })
      : boards;

    return orderBy(sorted, ["global", "createdAt"], "asc").map((el) => ({
      label: el.name,
      value: el.id,
      icon: el.global ? <GlobalOutlined /> : <Icon component={NoteIcon} />,
      key: el.id,
    }));
  }, [boards, searchQuery]);

  if (loading) {
    return (
      <div
        className="module-sider-container"
        css={{
          justifyContent: "center",
        }}
      >
        <Spin />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="module-sider-container"
        css={{
          justifyContent: "center",
        }}
      >
        <div className="module-sider-error">
          <h1>{t("Error")}</h1>
          <p>{t(error.message)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-sider-container">
      <div className="module-sider-content">
        {role <= RoleAccessLevels.GENERAL_MANAGER && (
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
      </div>
      <div className="module-sider-menu-container">
        <Menu
          items={menuItems}
          onSelect={({ key }) => {
            navigate(key, { replace: true });
            setDrawerOpen(false);
          }}
          selectedKeys={selectedBoard ? [selectedBoard.id] : []}
          className="module-sider-menu"
        />
      </div>
      <ManageModuleDialog ref={baseRef} moduleName="Notes Board" />
    </div>
  );
};
