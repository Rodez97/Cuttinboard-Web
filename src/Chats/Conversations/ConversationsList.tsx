/** @jsx jsx */
import { jsx } from "@emotion/react";
import orderBy from "lodash-es/orderBy";
import { useCallback, useMemo, useState } from "react";
import { matchSorter } from "match-sorter";
import Icon from "@ant-design/icons";
import { Input, Spin, Typography } from "antd/es";
import { useTranslation } from "react-i18next";
import Forum from "@mdi/svg/svg/forum.svg";
import { useConversations } from "@rodez97/cuttinboard-library";
import ConversationListItem from "./ConversationListItem";
import { useNavigate } from "react-router-dom";
import { IConversation } from "@rodez97/types-helpers";
import { useDrawerSiderContext } from "../../shared/organisms/useDrawerSider";

export default () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { conversations, activeConversation, loading, error } =
    useConversations();
  const [searchQuery, setSearchQuery] = useState("");
  const { setDrawerOpen } = useDrawerSiderContext();

  const sortedConversations = useMemo(() => {
    if (!conversations) {
      return [];
    }

    const sorted = searchQuery
      ? matchSorter(conversations, searchQuery, {
          keys: ["name"],
        })
      : conversations;

    return orderBy(sorted, (e) => e.recentMessage ?? e.createdAt, "desc");
  }, [conversations, searchQuery]);

  const selectActiveConversation = useCallback(
    (conversation: IConversation) => {
      navigate(conversation.id);
      setDrawerOpen(false);
    },
    [navigate, setDrawerOpen]
  );

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
        <div className="module-sider-header">
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
            {t("My Message Boards")}
          </Typography.Text>
        </div>

        <Input.Search
          placeholder={t("Search")}
          value={searchQuery}
          onChange={({ currentTarget: { value } }) => setSearchQuery(value)}
        />
      </div>
      <div className="module-sider-menu-container">
        {sortedConversations.map((conversation) => (
          <ConversationListItem
            key={conversation.id}
            conversation={conversation}
            selected={activeConversation?.id === conversation.id}
            onSelect={selectActiveConversation}
          />
        ))}
      </div>
    </div>
  );
};
