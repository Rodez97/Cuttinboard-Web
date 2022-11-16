/** @jsx jsx */
import { jsx } from "@emotion/react";
import { orderBy } from "lodash";
import { useMemo, useState } from "react";
import {
  useCuttinboard,
  useDMs,
  useEmployeesList,
  useNotificationsBadges,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { useNavigate, useParams } from "react-router-dom";
import { matchSorter } from "match-sorter";
import { Avatar, Badge, Button, Checkbox, Input, Menu, Space } from "antd";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { DarkPageHeader } from "../../components/PageHeaders";
import { useTranslation } from "react-i18next";
import Icon, { PlusOutlined, UserOutlined } from "@ant-design/icons";
import MessageTextLock from "@mdi/svg/svg/message-text-lock.svg";
import { Chat } from "@cuttinboard-solutions/cuttinboard-library/models";
import { useDisclose } from "../../hooks";
import NewDM from "./NewDM";

function DMList() {
  const { locationId } = useParams();
  const [underLocation] = useState(!!locationId);
  const [filterByLocation, setFilterByLocation] = useState(
    Boolean(locationId != null)
  );
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { chats, chatId } = useDMs();
  const { getDMBadge } = useNotificationsBadges();
  const [searchQuery, setSearchQuery] = useState("");
  const { notifications } = useCuttinboard();
  const { getEmployees } = underLocation && useEmployeesList();
  const [newDmOpen, openNewDm, closeNewDm] = useDisclose();

  const getChats = useMemo(() => {
    let filteredLocations: Chat[] = [];
    if (underLocation && filterByLocation) {
      filteredLocations = chats.filter((cht) =>
        getEmployees.some((e) => cht.recipient.id === e.id)
      );
    } else {
      filteredLocations = chats;
    }
    const sorted = matchSorter(filteredLocations, searchQuery, {
      keys: [(e) => e.recipient.fullName],
    });

    return orderBy(sorted, "getOrderTime", "desc")?.map((el) => {
      const { fullName, avatar } = el.recipient;
      return {
        label: (
          <Badge
            count={getDMBadge(el.id)}
            size="small"
            css={{ color: "inherit" }}
            offset={[10, 0]}
          >
            <p>{fullName}</p>
          </Badge>
        ),
        value: el.id,
        icon: <Avatar src={avatar} icon={<UserOutlined />} />,
        key: el.id,
      };
    });
  }, [
    chats,
    searchQuery,
    notifications,
    underLocation,
    locationId,
    filterByLocation,
  ]);

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
          title={t("Chats")}
          avatar={{ src: <Icon component={MessageTextLock} /> }}
          onBack={() => navigate(-1)}
          css={{ paddingBottom: 0, paddingTop: 0 }}
        />
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
            css={{ justifySelf: "center", color: "#fff" }}
            checked={filterByLocation}
            onChange={(e) => setFilterByLocation(e.target.checked)}
          >
            {t("Show only location members")}
          </Checkbox>
        )}
      </Space>
      <Menu
        theme="dark"
        items={getChats}
        onSelect={({ key }) => navigate(key, { replace: true })}
        selectedKeys={[chatId]}
      />

      <NewDM open={newDmOpen} onCancel={closeNewDm} onClose={closeNewDm} />
    </Space>
  );
}

export default DMList;
