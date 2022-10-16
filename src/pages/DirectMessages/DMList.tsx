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
import { getAvatarByUID } from "utils/utils";
import { Chat } from "@cuttinboard-solutions/cuttinboard-library/models";
import { useNewElement } from "hooks/useNewElement";

function DMList({
  underLocation,
  filterChecked,
  onFilterCheckedChange,
}: {
  underLocation?: boolean;
  filterChecked?: boolean;
  onFilterCheckedChange?: (newValue: boolean) => void;
}) {
  const navigate = useNavigate();
  const { locationId } = useParams();
  const newElement = useNewElement();
  const { t } = useTranslation();
  const { chats, chatId } = useDMs();
  const { getDMBadge } = useNotificationsBadges();
  const [searchQuery, setSearchQuery] = useState("");
  const { notifications } = useCuttinboard();
  const { getEmployees } = underLocation && useEmployeesList();

  const getChats = useMemo(() => {
    let filteredLocations: Chat[] = [];
    if (underLocation && filterChecked) {
      filteredLocations = chats.filter((cht) =>
        getEmployees.some((e) => cht.recipient.id === e.id)
      );
    } else {
      filteredLocations = chats;
    }
    const sorted = matchSorter(filteredLocations, searchQuery, {
      keys: [(e) => e.recipient.name],
    });

    return orderBy(sorted, "getOrderTime", "desc")?.map((el) => {
      const { id, name } = el.recipient;
      return {
        label: (
          <Badge
            count={getDMBadge(el.id)}
            size="small"
            css={{ color: "inherit" }}
            offset={[10, 0]}
          >
            <p>{name}</p>
          </Badge>
        ),
        value: el.id,
        icon: <Avatar src={getAvatarByUID(id)} icon={<UserOutlined />} />,
        key: el.id,
      };
    });
  }, [
    chats,
    searchQuery,
    notifications,
    underLocation,
    locationId,
    filterChecked,
  ]);

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
        avatar={{ src: <Icon component={MessageTextLock} /> }}
        onBack={() =>
          navigate(
            locationId != null ? `/location/${locationId}` : "/dashboard"
          )
        }
        css={{ paddingBottom: 0, paddingTop: 0 }}
      />
      <Button icon={<PlusOutlined />} block type="dashed" onClick={newElement}>
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
          checked={filterChecked}
          onChange={(e) => onFilterCheckedChange(e.target.checked)}
        >
          {t("Show only location members")}
        </Checkbox>
      )}
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
