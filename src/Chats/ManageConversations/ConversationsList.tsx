/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useCallback, useMemo, useState } from "react";
import { matchSorter } from "match-sorter";
import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Input,
  Layout,
  Space,
  Spin,
  Table,
  TableColumnsType,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";
import { useManageConvs } from "./ManageConvDialog";
import { useNavigate } from "react-router-dom";
import { GrayPageHeader, LoadingPage } from "../../shared";
import dayjs from "dayjs";
import ConversationMenu from "./ConversationMenu";
import { useManageMembers } from "./ConvManageMembers";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { useConversations } from "@cuttinboard-solutions/cuttinboard-library";
import {
  IConversation,
  PrivacyLevel,
  privacyLevelToString,
} from "@cuttinboard-solutions/types-helpers";
import EmptyExtended from "../../shared/molecules/EmptyExtended";
dayjs.extend(LocalizedFormat);

export default () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { conversations, loading, error } = useConversations();
  const [searchQuery, setSearchQuery] = useState("");
  const { ManageConvDialog, newConversation, editConversation } =
    useManageConvs();
  const { ConvManageMembers, openDialog } = useManageMembers();

  const sortedConversations = useMemo(() => {
    if (!conversations) {
      return [];
    }

    return searchQuery
      ? matchSorter(conversations, searchQuery, {
          keys: ["name"],
        })
      : conversations;
  }, [conversations, searchQuery]);

  const selectActiveConversation = useCallback(
    (conversation: IConversation) => {
      navigate(conversation.id);
    },
    [navigate]
  );

  const columns = useMemo<TableColumnsType<IConversation>>(
    () => [
      {
        title: t("Name"),
        dataIndex: "name",
        key: "name",
        ellipsis: {
          showTitle: false,
        },
        render: (_, { name }) => {
          return (
            <Typography.Paragraph
              ellipsis={{ rows: 1 }}
              css={{
                marginBottom: "0px !important",
              }}
            >
              {name}
            </Typography.Paragraph>
          );
        },
        sorter: (a, b) => a.name.localeCompare(b.name),
        sortDirections: ["ascend", "descend", "ascend"],
      },
      {
        title: t("Membership Type"),
        dataIndex: "privacyLevel",
        key: "privacyLevel",
        render: (_, { privacyLevel, position }) => (
          <Typography.Text>
            {t(privacyLevelToString(privacyLevel))}
            {privacyLevel === PrivacyLevel.POSITIONS &&
              position &&
              `(${position})`}
          </Typography.Text>
        ),
        sorter: (a, b) => a.privacyLevel - b.privacyLevel,
      },
      {
        title: "Date of Creation",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (_, { createdAt }) => (
          <Typography.Text>{dayjs(createdAt).format("L LT")}</Typography.Text>
        ),
        sorter: (a, b) => a.createdAt - b.createdAt,
        align: "right",
        defaultSortOrder: "descend",
      },
      {
        title: "",
        dataIndex: "actions",
        key: "actions",
        render: (_, conversation) => (
          <ConversationMenu
            conversation={conversation}
            onEdit={editConversation}
            onViewMessageHistory={selectActiveConversation}
            onManageMembers={(conv) => openDialog(conv.id)}
          />
        ),
        align: "center",
        width: 100,
      },
    ],
    [editConversation, openDialog, selectActiveConversation, t]
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
    <Layout.Content
      css={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <GrayPageHeader title={t("Manage Conversations")} />

      <Space
        size="large"
        css={{
          display: "flex",
          padding: "10px 20px",
          alignItems: "center",
        }}
      >
        <Button
          key="members"
          type="primary"
          onClick={newConversation}
          icon={<PlusOutlined />}
        >
          {t("Add new conversation")}
        </Button>

        <Input.Search
          placeholder={t("Search")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          css={{ width: 200 }}
        />
      </Space>

      {loading ? (
        <LoadingPage />
      ) : conversations.length ? (
        <div
          css={{
            display: "flex",
            flexDirection: "column",
            padding: 20,
            paddingTop: 0,
            overflow: "auto",
          }}
        >
          <Table
            dataSource={sortedConversations}
            columns={columns}
            size="small"
            css={{
              minWidth: 700,
              margin: "auto",
            }}
            pagination={false}
            sticky
          />
        </div>
      ) : (
        <EmptyExtended
          description={
            <p>
              {t("No conversations in this location")}
              {". "}
              <a>{t("Add Conversation")}</a> {t("or")} <a>{t("learn more")}</a>
            </p>
          }
          descriptions={[
            "Define the Conversations that need to be happening at your location",
            "Improve communication and team effectiveness",
            "Manage and supervise conversations",
          ]}
        />
      )}

      {ManageConvDialog}
      {ConvManageMembers}
    </Layout.Content>
  );
};
