/** @jsx jsx */
import { jsx } from "@emotion/react";
import { orderBy } from "lodash";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { matchSorter } from "match-sorter";
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Input,
  Menu,
  Space,
  Typography,
} from "antd";
import { useTranslation } from "react-i18next";
import Icon, { PlusOutlined, UserOutlined } from "@ant-design/icons";
import MessageTextLock from "@mdi/svg/svg/message-text-lock.svg";
import NewDM from "./NewDM";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library/services";
import { useEmployeesList } from "@cuttinboard-solutions/cuttinboard-library/employee";
import {
  Chat,
  useDirectMessageChat,
} from "@cuttinboard-solutions/cuttinboard-library/chats";
import { useDisclose } from "@cuttinboard-solutions/cuttinboard-library/utils";

export default () => {
  const { locationId } = useParams();
  const [underLocation] = useState(!!locationId);
  const [filterByLocation, setFilterByLocation] = useState(
    Boolean(locationId != null)
  );
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { directMessageChats, selectedDirectMessageChatId } =
    useDirectMessageChat();
  const [searchQuery, setSearchQuery] = useState("");
  const { notifications } = useCuttinboard();
  const empContext = underLocation && useEmployeesList();
  const [newDmOpen, openNewDm, closeNewDm] = useDisclose();

  const getChats = useMemo(() => {
    let filteredChats: Chat[] = [];
    if (underLocation && filterByLocation && empContext) {
      filteredChats = directMessageChats
        ? directMessageChats.filter((chat) =>
            empContext.getEmployees.some(
              (employee) => chat.recipient?.id === employee.id
            )
          )
        : [];
    } else {
      filteredChats = directMessageChats ? directMessageChats : [];
    }
    const sorted = matchSorter(filteredChats, searchQuery, {
      keys: [(chat) => (chat.recipient ? chat.recipient.fullName : "")],
    });

    return orderBy(
      sorted,
      (chat) => (chat.recipient ? chat.recipient.fullName : t("Removed User")),
      "desc"
    ).map((chat) => {
      const fullName = chat.recipient
        ? chat.recipient.fullName
        : t("Removed User");
      const avatar = chat.recipient ? chat.recipient.avatar : null;
      const badges = notifications ? notifications.getDMBadge(chat.id) : 0;
      return {
        label: (
          <div
            css={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Badge count={badges} size="small" />
            <Avatar src={avatar} icon={<UserOutlined />} />
            {fullName}
          </div>
        ),
        value: chat.id,
        key: chat.id,
      };
    });
  }, [
    underLocation,
    filterByLocation,
    empContext,
    searchQuery,
    directMessageChats,
    t,
    notifications,
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
            {t("Chats")}
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
        {underLocation && (
          <Checkbox
            css={{ justifySelf: "center", color: "#74726e" }}
            checked={filterByLocation}
            onChange={(e) => setFilterByLocation(e.target.checked)}
          >
            {t("Show only location members")}
          </Checkbox>
        )}
      </Space>
      <Menu
        items={getChats}
        onSelect={({ key }) => navigate(key, { replace: true })}
        selectedKeys={[selectedDirectMessageChatId]}
        className="module-sider-menu"
      />

      <NewDM open={newDmOpen} onCancel={closeNewDm} onClose={closeNewDm} />
    </Space>
  );
};
