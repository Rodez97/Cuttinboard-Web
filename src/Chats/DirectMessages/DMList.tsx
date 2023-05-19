/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useCallback, useMemo, useState } from "react";
import { matchSorter } from "match-sorter";
import { Avatar, Badge, Button, Input, Spin, Typography } from "antd/es";
import { useTranslation } from "react-i18next";
import Icon, { PlusOutlined, UserOutlined } from "@ant-design/icons";
import MessageTextLock from "@mdi/svg/svg/message-text-lock.svg";
import NewDM from "./NewDM";
import {
  useDirectMessageChat,
  useNotifications,
  useDisclose,
  useCuttinboard,
  getDirectMessageRecipient,
} from "@cuttinboard-solutions/cuttinboard-library";
import CuttinboardAvatar from "../../shared/atoms/Avatar";
import orderBy from "lodash-es/orderBy";
import { useNavigate } from "react-router-dom";
import { IDirectMessage, Sender } from "@cuttinboard-solutions/types-helpers";

interface IDMItem {
  chat: IDirectMessage;
  recipient: Sender;
}

export default ({ locationId }: { locationId?: string }) => {
  const { t } = useTranslation();
  const { user } = useCuttinboard();
  const { directMessages, loading, error } = useDirectMessageChat();
  const [searchQuery, setSearchQuery] = useState("");
  const [newDmOpen, openNewDm, closeNewDm] = useDisclose();

  const getChats = useMemo<IDMItem[]>(() => {
    if (!directMessages) {
      return [];
    }

    const ordered = directMessages.map((chat) => {
      return {
        chat,
        recipient: getDirectMessageRecipient(chat, user.uid),
      };
    });

    const sorted = searchQuery
      ? matchSorter(ordered, searchQuery, {
          keys: ["recipient.name"],
        })
      : ordered;

    return orderBy(
      sorted,
      (e) => e.chat.recentMessage ?? e.chat.createdAt,
      "desc"
    );
  }, [directMessages, searchQuery, user.uid]);

  const renderChatItem = useCallback(
    (chat: IDMItem) => <DMListItem {...chat} key={chat.chat.id} />,
    []
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
            component={MessageTextLock}
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
            {t("Direct Messages")}
          </Typography.Text>
        </div>
        <Button icon={<PlusOutlined />} block type="dashed" onClick={openNewDm}>
          {t("Add")}
        </Button>
        <Input.Search
          placeholder={t("Search")}
          value={searchQuery}
          onChange={({ currentTarget: { value } }) => setSearchQuery(value)}
        />
      </div>
      <div className="module-sider-menu-container">
        {getChats.map(renderChatItem)}
      </div>
      <NewDM
        open={newDmOpen}
        onCancel={closeNewDm}
        onClose={closeNewDm}
        locationId={locationId}
      />
    </div>
  );
};

const DMListItem = ({ chat, recipient }: IDMItem) => {
  const navigate = useNavigate();
  const { selectedDirectMessage } = useDirectMessageChat();
  const { getDMBadgesById } = useNotifications();

  const badges = useMemo(
    () => getDMBadgesById(chat.id),
    [chat.id, getDMBadgesById]
  );

  const selectActiveDM = useCallback(
    (chatId: string) => () => {
      navigate(chatId);
    },
    [navigate]
  );

  return (
    <div
      className={`dm-list-item ${
        selectedDirectMessage?.id === chat.id ? "dm-list-item__active" : ""
      } dm-list-item__with-avatar`}
      onClick={selectActiveDM(chat.id)}
    >
      {recipient._id === "deleted" ? (
        <Avatar icon={<UserOutlined />} />
      ) : (
        <CuttinboardAvatar
          src={recipient.avatar}
          alt={recipient.name}
          className="dm-list-item__avatar"
        />
      )}

      <p className="dm-list-item__text">{recipient.name}</p>
      <Badge count={badges} size="small" />
    </div>
  );
};
