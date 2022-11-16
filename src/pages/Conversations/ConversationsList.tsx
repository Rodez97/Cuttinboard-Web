/** @jsx jsx */
import { jsx } from "@emotion/react";
import { orderBy } from "lodash";
import { useMemo, useState } from "react";
import {
  useConversations,
  useCuttinboard,
  useLocation,
  useNotificationsBadges,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  Colors,
  RoleAccessLevels,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { useNavigate, useParams } from "react-router-dom";
import { matchSorter } from "match-sorter";
import { MessageOutlined, PlusOutlined } from "@ant-design/icons";
import { Badge, Button, Input, Menu, Space } from "antd";
import { DarkPageHeader } from "../../components/PageHeaders";
import { useTranslation } from "react-i18next";
import ManageConvDialog, { useManageConvs } from "./ManageConvDialog";

function ConversationsList() {
  const { boardId } = useParams();
  const { locationAccessKey } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { conversations, conversationId } = useConversations();
  const { getModuleBadge } = useNotificationsBadges();
  const { notifications } = useCuttinboard();
  const [searchQuery, setSearchQuery] = useState("");
  const { baseRef, newConv } = useManageConvs();

  const menuItems = useMemo(() => {
    const sorted = matchSorter(conversations, searchQuery, { keys: ["name"] });

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
  }, [conversations, searchQuery, notifications, boardId]);

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
          title={t("Conversations")}
          onBack={() => navigate(-1)}
          css={{ paddingBottom: 0, paddingTop: 0 }}
        />
        {locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER && (
          <Button icon={<PlusOutlined />} block type="dashed" onClick={newConv}>
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
        theme="dark"
        items={menuItems}
        onSelect={({ key }) => navigate(key, { replace: true })}
        selectedKeys={[conversationId]}
      />
      <ManageConvDialog ref={baseRef} />
    </Space>
  );
}

export default ConversationsList;
