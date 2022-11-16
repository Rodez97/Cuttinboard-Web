/** @jsx jsx */
import { jsx } from "@emotion/react";
import Icon, { PlusOutlined } from "@ant-design/icons";
import {
  useCuttinboardModule,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  Colors,
  RoleAccessLevels,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { Button, Input, Menu, MenuProps, Space } from "antd";
import { orderBy } from "lodash";
import { matchSorter } from "match-sorter";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Note } from "./notesIcons";
import { DarkPageHeader } from "../../components";
import ManageModuleDialog, {
  useManageModule,
} from "../ManageApp/ManageModuleDialog";

function NotesList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedApp, elements } = useCuttinboardModule();
  const { locationAccessKey } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { baseRef, newModule } = useManageModule();

  const menuItems = useMemo((): MenuProps["items"] => {
    const sorted = matchSorter(elements, searchQuery, { keys: ["name"] });

    return orderBy(sorted, "createdAt", "desc")?.map((el) => ({
      label: el.name,
      value: el.id,
      icon: <Icon component={Note} />,
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
          title={t("Notes")}
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
      <ManageModuleDialog ref={baseRef} moduleName="Notes Stack" />
    </Space>
  );
}

export default NotesList;
