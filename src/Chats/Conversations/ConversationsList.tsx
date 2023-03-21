/** @jsx jsx */
import { jsx } from "@emotion/react";
import { orderBy } from "lodash";
import { useCallback, useMemo, useState } from "react";
import { matchSorter } from "match-sorter";
import Icon from "@ant-design/icons";
import { Input, Spin, Typography } from "antd";
import { useTranslation } from "react-i18next";
import Forum from "@mdi/svg/svg/forum.svg";
import { useConversations } from "@cuttinboard-solutions/cuttinboard-library";
import ConversationListItem from "./ConversationListItem";
import { useNavigate } from "react-router-dom";
import { IConversation } from "@cuttinboard-solutions/types-helpers";

export default () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { conversations, activeConversation, loading, error } =
    useConversations();
  const [searchQuery, setSearchQuery] = useState("");

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
    },
    [navigate]
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
          <p>{t(error)}</p>
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
            {t("My Conversations")}
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
