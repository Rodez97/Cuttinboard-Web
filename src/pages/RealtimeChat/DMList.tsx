/** @jsx jsx */
import { jsx } from "@emotion/react";
import { orderBy } from "lodash";
import { useMemo, useState } from "react";
import {
  useCuttinboard,
  useDMs,
  useEmployeesList,
  useNotificationsBadges,
} from "@cuttinboard/cuttinboard-library/services";
import { Auth } from "@cuttinboard/cuttinboard-library/firebase";
import { useNavigate } from "react-router-dom";
import { matchSorter } from "match-sorter";
import { Avatar, Badge, Button, Input, Menu, Space } from "antd";
import { Colors } from "@cuttinboard/cuttinboard-library/utils";
import { DarkPageHeader } from "../../components/PageHeaders";
import { useTranslation } from "react-i18next";
import Icon, { PlusOutlined, UserOutlined } from "@ant-design/icons";
import MessageTextLock from "@mdi/svg/svg/message-text-lock.svg";

function DMList() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getUniqAllEmployees, getEmployees, getOrgEmployees } =
    useEmployeesList();
  const { chats, chatId } = useDMs();
  const { getDMBadge } = useNotificationsBadges();
  const [searchQuery, setSearchQuery] = useState("");
  const { notifications } = useCuttinboard();

  const getChats = useMemo(() => {
    const withRecipient = chats.map((chat) => {
      const { members } = chat;
      const other = Object.keys(members).find(
        (id) => id !== Auth.currentUser.uid
      );
      const recipient = getUniqAllEmployees().find(({ id }) => id === other);
      return {
        ...chat,
        recipient,
      };
    });
    const sorted = matchSorter(withRecipient, searchQuery, {
      keys: ["recipient.name", "recipient.lastName"],
    });
    return orderBy(sorted, "createdAt", "desc")?.map((el) => ({
      label: (
        <Badge
          count={getDMBadge(el.id)}
          size="small"
          css={{ color: "inherit" }}
          offset={[10, 0]}
        >
          <p>{`${el.recipient.name} ${el.recipient.lastName}`}</p>
        </Badge>
      ),
      value: el.id,
      icon: <Avatar src={el.recipient.avatar} icon={<UserOutlined />} />,
      key: el.id,
    }));
  }, [chats, getEmployees, getOrgEmployees, searchQuery, notifications]);

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
        title={t("Chats")}
        backIcon={<Icon component={MessageTextLock} />}
        onBack={() => false}
        css={{ paddingBottom: 0, paddingTop: 0 }}
      />
      <Button
        icon={<PlusOutlined />}
        block
        type="dashed"
        onClick={() => navigate("new")}
      >
        {t("Add")}
      </Button>
      <Input.Search
        placeholder={t("Search")}
        value={searchQuery}
        onChange={({ currentTarget: { value } }) => setSearchQuery(value)}
      />
      <Menu
        theme="dark"
        items={getChats}
        onSelect={({ key }) => navigate(key)}
        selectedKeys={[chatId]}
      />
    </Space>
  );
}

export default DMList;
