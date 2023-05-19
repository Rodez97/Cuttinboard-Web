/** @jsx jsx */
import { jsx } from "@emotion/react";
import Icon, { PlusOutlined } from "@ant-design/icons";
import { Button, Input, Menu, MenuProps } from "antd/es";
import orderBy from "lodash-es/orderBy";
import { matchSorter } from "match-sorter";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ManageBoard, { useManageBoard } from "../ManageBoard";
import { NoteIcon } from "../../Modules/Notes/notesIcons";
import { useGBoard } from "@cuttinboard-solutions/cuttinboard-library";

export default () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedBoard, boards } = useGBoard();
  const [searchQuery, setSearchQuery] = useState("");
  const { baseRef, newBoard } = useManageBoard();

  const menuItems = useMemo((): MenuProps["items"] => {
    const sorted = boards
      ? matchSorter(boards, searchQuery, { keys: ["name"] })
      : [];

    return orderBy(sorted, "createdAt", "asc")?.map((el) => ({
      label: el.name,
      value: el.id,
      icon: <Icon component={NoteIcon} />,
      key: el.id,
    }));
  }, [boards, searchQuery]);

  return (
    <div className="module-sider-container">
      <div className="module-sider-content">
        <Button icon={<PlusOutlined />} block type="dashed" onClick={newBoard}>
          {t("Add")}
        </Button>
        <Input.Search
          placeholder={t("Search")}
          value={searchQuery}
          onChange={({ currentTarget: { value } }) => setSearchQuery(value)}
        />
      </div>
      <div className="module-sider-menu-container">
        <Menu
          items={menuItems}
          onSelect={({ key }) => navigate(key, { replace: true })}
          selectedKeys={selectedBoard ? [selectedBoard.id] : []}
          className="module-sider-menu"
        />
      </div>
      <ManageBoard ref={baseRef} moduleName="Notes Board" />
    </div>
  );
};
