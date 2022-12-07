/** @jsx jsx */
import { jsx } from "@emotion/react";
import { orderBy } from "lodash";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { matchSorter } from "match-sorter";
import Icon, { MessageOutlined, PlusOutlined } from "@ant-design/icons";
import { Badge, Button, Input, Menu, Space, Typography } from "antd";
import { useTranslation } from "react-i18next";
import ManageConvDialog, { useManageConvs } from "./ManageConvDialog";
import Forum from "@mdi/svg/svg/forum.svg";
import {
  useCuttinboard,
  useCuttinboardLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { useConversations } from "@cuttinboard-solutions/cuttinboard-library/chats";
import { RoleAccessLevels } from "@cuttinboard-solutions/cuttinboard-library/utils";

export default () => {
  const { locationAccessKey, location } = useCuttinboardLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { allConversations, activeConversationId } = useConversations();
  const { notifications } = useCuttinboard();
  const [searchQuery, setSearchQuery] = useState("");
  const { baseRef, newConv } = useManageConvs();

  const menuItems = useMemo(() => {
    if (!allConversations) {
      return [];
    }
    const sorted = matchSorter(allConversations, searchQuery, {
      keys: ["name"],
    });

    return orderBy(sorted, "createdAt", "desc")?.map((el) => {
      const badges = notifications
        ? notifications.getConversationBadges(
            location.organizationId,
            location.id,
            el.id
          )
        : 0;
      return {
        label: el.name,
        value: el.id,
        icon: (
          <Badge count={badges} size="small">
            <MessageOutlined />
          </Badge>
        ),
        key: el.id,
      };
    });
  }, [
    allConversations,
    searchQuery,
    notifications,
    location.organizationId,
    location.id,
  ]);

  return (
    <Space direction="vertical" className="module-sider-container">
      <Space direction="vertical" className="module-sider-content">
        <div
          css={{
            display: "flex",
            alignItems: "center",
            padding: "5px 10px",
            justifyContent: "center",
          }}
        >
          <Icon
            component={Forum}
            css={{
              fontSize: "20px",
              color: "#74726e",
            }}
          />
          <Typography.Text
            css={{
              color: "#74726e",
              fontSize: "20px",
              marginLeft: "10px",
            }}
          >
            {t("Conversations")}
          </Typography.Text>
        </div>
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
        items={menuItems}
        onSelect={({ key }) => navigate(key, { replace: true })}
        selectedKeys={[activeConversationId]}
        className="module-sider-menu"
      />
      <ManageConvDialog ref={baseRef} />
    </Space>
  );
};
