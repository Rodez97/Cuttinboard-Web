/** @jsx jsx */
import {
  useConversations,
  useEmployeesList,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { jsx } from "@emotion/react";
import { Button, Divider, Modal, Switch } from "antd";
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
import { getPrivacyLevelTextByNumber, recordError } from "../../utils/utils";
import {
  PrivacyLevel,
  RoleAccessLevels,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { GrayPageHeader } from "../../components/PageHeaders";

function ConvDetails() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { selectedConversation, canManage } = useConversations();
  const { locationAccessKey } = useLocation();
  const { getEmployees } = useEmployeesList();

  const deleteConv = useCallback(async () => {
    if (!canManage) {
      return;
    }
    Modal.confirm({
      title: t("Do you want to delete this conversation?"),
      icon: <ExclamationCircleOutlined />,
      async onOk() {
        try {
          navigate(-2);
          await selectedConversation.delete();
        } catch (error) {
          recordError(error);
        }
      },
      onCancel() {},
    });
  }, [selectedConversation]);

  const hosts = useMemo(() => {
    if (!Boolean(selectedConversation.hosts?.length)) {
      return [];
    }
    return getEmployees.filter(
      (e) => selectedConversation.hosts.indexOf(e.id) > -1
    );
  }, [getEmployees, selectedConversation]);

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
              description={selectedConversation.name}
            />
          </List.Item>
          <List.Item>
            <List.Item.Meta
              avatar={
                selectedConversation.privacyLevel === PrivacyLevel.PRIVATE ? (
                  <LockOutlined />
                ) : selectedConversation.privacyLevel ===
                  PrivacyLevel.POSITIONS ? (
                  <TagsOutlined />
                ) : (
                  <GlobalOutlined />
                )
              }
              title={t("Privacy Level")}
              description={t(
                getPrivacyLevelTextByNumber(selectedConversation.privacyLevel)
              )}
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
                Boolean(selectedConversation.description)
                  ? selectedConversation.description
                  : "---"
              }
            />
          </List.Item>
          {selectedConversation.privacyLevel === PrivacyLevel.PRIVATE && (
            <List.Item>
              <List.Item.Meta
                avatar={<TeamOutlined />}
                title={t("Members")}
                description={selectedConversation.members?.length ?? 0}
              />
            </List.Item>
          )}

          {selectedConversation.privacyLevel === PrivacyLevel.POSITIONS &&
            Boolean(selectedConversation.position) && (
              <List.Item>
                <List.Item.Meta
                  avatar={<TagOutlined />}
                  title={t("Position")}
                  description={selectedConversation.position}
                />
              </List.Item>
            )}
          <Divider />
          <List.Item
            hidden={!selectedConversation.iAmMember}
            extra={
              <Switch
                checked={selectedConversation.isMuted}
                onChange={() => {
                  selectedConversation.toggleMuteChat();
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
