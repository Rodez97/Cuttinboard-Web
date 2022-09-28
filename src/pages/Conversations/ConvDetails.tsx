/** @jsx jsx */
import {
  useConversations,
  useEmployeesList,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { jsx } from "@emotion/react";
import { Avatar, Button, Divider, Space, Switch, Tag } from "antd";
import { GrayPageHeader } from "components/PageHeaders";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { List } from "antd";
import {
  CrownOutlined,
  DeleteOutlined,
  EditOutlined,
  FormOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  LockOutlined,
  NotificationOutlined,
  TagsOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Auth } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { useCallback } from "react";
import { recordError } from "utils/utils";
import {
  PrivacyLevel,
  RoleAccessLevels,
} from "@cuttinboard-solutions/cuttinboard-library/utils";

function ConvDetails() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { selectedChat, deleteConversation } = useConversations();
  const { locationAccessKey } = useLocation();
  const { getUniqAllEmployees, getOrgEmployees, getEmployees } =
    useEmployeesList();

  const deleteConv = useCallback(async () => {
    try {
      await deleteConversation();
    } catch (error) {
      recordError(error);
    }
  }, [selectedChat]);

  const host = useMemo(() => {
    if (!selectedChat.hostId) {
      return null;
    }
    return getUniqAllEmployees().find((e) => e.id === selectedChat.hostId);
  }, [getOrgEmployees, getEmployees, selectedChat]);

  return (
    <div>
      <GrayPageHeader title={t("Details")} onBack={() => navigate(-1)} />
      <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
        <div
          css={{
            minWidth: 270,
            maxWidth: 400,
            margin: "auto",
            width: "100%",
          }}
        >
          <Divider orientation="left">{t("About")}</Divider>
          <List.Item>
            <List.Item.Meta
              avatar={<FormOutlined />}
              title={t("Name")}
              description={selectedChat.name}
            />
          </List.Item>
          <List.Item>
            <List.Item.Meta
              avatar={
                selectedChat.privacyLevel === PrivacyLevel.PRIVATE ? (
                  <LockOutlined />
                ) : selectedChat.privacyLevel === PrivacyLevel.POSITIONS ? (
                  <TagsOutlined />
                ) : (
                  <GlobalOutlined />
                )
              }
              title={t("Privacy Level")}
              description={t(selectedChat.privacyLevel)}
            />
          </List.Item>
          {host && (
            <List.Item>
              <List.Item.Meta
                avatar={<CrownOutlined />}
                title={t("Host")}
                description={`${host.name} ${host.lastName}`}
              />
            </List.Item>
          )}
          <List.Item>
            <List.Item.Meta
              avatar={<InfoCircleOutlined />}
              title={t("Description")}
              description={
                Boolean(selectedChat.description)
                  ? selectedChat.description
                  : "---"
              }
            />
          </List.Item>
          <List.Item>
            <List.Item.Meta
              avatar={<TeamOutlined />}
              title={t("Members")}
              description={selectedChat.members?.length ?? 0}
            />
          </List.Item>
          {selectedChat.privacyLevel === PrivacyLevel.POSITIONS &&
            selectedChat.positions?.length && (
              <Space
                wrap
                css={{
                  border: "1px solid #00000025",
                  width: "100%",
                  padding: 10,
                }}
              >
                {selectedChat.positions.map((p) => (
                  <Tag key={p}>{p}</Tag>
                ))}
              </Space>
            )}
          <Divider />
          <List.Item
            extra={
              <Switch
                checked={selectedChat.isMuted}
                onChange={() => {
                  selectedChat.toggleMuteChat();
                }}
              />
            }
          >
            <List.Item.Meta
              avatar={<NotificationOutlined />}
              title={t("Mute push notifications")}
            />
          </List.Item>
          {locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER && (
            <div
              css={{
                gap: 12,
                marginTop: 30,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Button
                icon={<EditOutlined />}
                type="dashed"
                block
                onClick={() => navigate("edit")}
              >
                {t("Edit Conversation")}
              </Button>
              <Button
                icon={<DeleteOutlined />}
                type="dashed"
                danger
                block
                onClick={deleteConv}
              >
                {t("Delete Conversation")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConvDetails;
