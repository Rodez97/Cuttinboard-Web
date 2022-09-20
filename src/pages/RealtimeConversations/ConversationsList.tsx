/** @jsx jsx */
import { jsx } from "@emotion/react";
import { orderBy } from "lodash";
import { useMemo, useState } from "react";
import {
  useConversations,
  useCuttinboard,
  useLocation,
  useNotificationsBadges,
} from "@cuttinboard/cuttinboard-library/services";
import {
  Colors,
  RoleAccessLevels,
} from "@cuttinboard/cuttinboard-library/utils";
import { useNavigate } from "react-router-dom";
import { matchSorter } from "match-sorter";
import Icon, { MessageOutlined, PlusOutlined } from "@ant-design/icons";
import { Badge, Button, Input, Menu, Space } from "antd";
import { DarkPageHeader } from "../../components/PageHeaders";
import { useTranslation } from "react-i18next";
import Forum from "@mdi/svg/svg/forum.svg";

function ConversationsList() {
  const { locationAccessKey } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { chats, chatId } = useConversations();
  const { getModuleBadge } = useNotificationsBadges();
  const { notifications } = useCuttinboard();
  const [searchQuery, setSearchQuery] = useState("");

  const menuItems = useMemo(() => {
    const sorted = matchSorter(chats, searchQuery, { keys: ["name"] });
    return orderBy(sorted, "createdAt", "desc")?.map((el) => ({
      label: (
        <Badge
          count={getModuleBadge("conv", el.id)}
          size="small"
          css={{ color: "inherit" }}
          offset={[10, 0]}
        >
          <p>{el.name}</p>
        </Badge>
      ),
      value: el.id,
      icon: <MessageOutlined />,
      key: el.id,
    }));
  }, [chats, searchQuery, notifications]);

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
        backIcon={<Icon component={Forum} />}
        title={t("Conversations")}
        onBack={() => false}
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
        selectedKeys={[chatId]}
      />
    </Space>
  );
}

export default ConversationsList;
