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
import { Button, Input, Menu, Space } from "antd";
import { orderBy } from "lodash";
import { matchSorter } from "match-sorter";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { DarkPageHeader } from "../../components/PageHeaders";
import { Note } from "./notesIcons";
import { useNewElement } from "../../hooks/useNewElement";

function NotesList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const newElement = useNewElement();
  const { selectedApp, elements } = useCuttinboardModule();
  const { locationAccessKey, location } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const menuItems = useMemo(() => {
    const sorted = matchSorter(elements, searchQuery, { keys: ["name"] });
    return orderBy(sorted, "createdAt", "desc")?.map((el) => ({
      label: el.name,
      value: el.id,
      icon: <Icon component={Note} />,
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
        title={t("Notes")}
        onBack={() =>
          navigate(`/location/${location.id}/apps`, { replace: true })
        }
        css={{ paddingBottom: 0, paddingTop: 0 }}
      />
      {locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER && (
        <Button
          icon={<PlusOutlined />}
          block
          type="dashed"
          onClick={newElement}
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

export default NotesList;
