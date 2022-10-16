/** @jsx jsx */
import {
  useConversations,
  useEmployeesList,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { jsx } from "@emotion/react";
import { Button, Divider, Modal, Switch } from "antd";
import { GrayPageHeader } from "components/PageHeaders";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { List } from "antd";
import {
  CrownOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FormOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  LockOutlined,
  NotificationOutlined,
  TagOutlined,
  TagsOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useCallback } from "react";
import { recordError } from "utils/utils";
import {
  PrivacyLevel,
  RoleAccessLevels,
} from "@cuttinboard-solutions/cuttinboard-library/utils";

function ConvDetails() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { selectedChat, canManageApp } = useConversations();
  const { locationAccessKey } = useLocation();
  const { getEmployees } = useEmployeesList();

  const deleteConv = useCallback(async () => {
    if (!canManageApp) {
      return;
    }
    Modal.confirm({
      title: t("Do you want to delete this conversation?"),
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        try {
          navigate(-2);
          await selectedChat.delete();
        } catch (error) {
          recordError(error);
        }
      },
      onCancel() {},
    });
  }, [selectedChat]);

  const hosts = useMemo(() => {
    if (!Boolean(selectedChat.hosts?.length)) {
      return [];
    }
    return getEmployees.filter((e) => selectedChat.hosts.indexOf(e.id) > -1);
  }, [getEmployees, selectedChat]);

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
          {Boolean(hosts.length) && (
            <List.Item>
              <List.Item.Meta
                avatar={<CrownOutlined />}
                title={t("Hosts")}
                description={hosts.map((host) => (
                  <p>{host.fullName}</p>
                ))}
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
          {selectedChat.privacyLevel === PrivacyLevel.PRIVATE && (
            <List.Item>
              <List.Item.Meta
                avatar={<TeamOutlined />}
                title={t("Members")}
                description={selectedChat.members?.length ?? 0}
              />
            </List.Item>
          )}

          {selectedChat.privacyLevel === PrivacyLevel.POSITIONS &&
            Boolean(selectedChat.positions?.length) && (
              <List.Item>
                <List.Item.Meta
                  avatar={<TagOutlined />}
                  title={t("Position")}
                  description={selectedChat.positions[0]}
                />
              </List.Item>
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
