/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Button, Divider, Modal, ModalProps, Switch } from "antd";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
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
  TagOutlined,
  TagsOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useCallback } from "react";
import { recordError } from "../../utils/utils";
import {
  PrivacyLevel,
  privacyLevelToString,
  RoleAccessLevels,
} from "@cuttinboard-solutions/cuttinboard-library/utils";
import { useConversations } from "@cuttinboard-solutions/cuttinboard-library/chats";
import { useCuttinboardLocation } from "@cuttinboard-solutions/cuttinboard-library/services";
import { useEmployeesList } from "@cuttinboard-solutions/cuttinboard-library/employee";

function ConvDetails({
  onEdit,
  ...props
}: ModalProps & { onEdit: () => void }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { activeConversation, canManage } = useConversations();
  const { locationAccessKey } = useCuttinboardLocation();
  const { getEmployees } = useEmployeesList();

  const deleteConv = useCallback(async () => {
    if (!canManage || !activeConversation) {
      return;
    }
    // Confirm delete
    Modal.confirm({
      title: t("Delete Conversation"),
      content: t("Are you sure you want to delete this conversation?"),
      okText: t("Delete"),
      okType: "danger",
      cancelText: t("Cancel"),
      onOk: async () => {
        try {
          await activeConversation.delete();
          navigate(-1);
        } catch (error) {
          recordError(error);
        }
      },
    });
  }, [canManage, navigate, activeConversation, t]);

  const admins = useMemo(() => {
    if (!activeConversation || !activeConversation.hosts) {
      return [];
    }
    return getEmployees.filter(
      (e) =>
        activeConversation.hosts && activeConversation.hosts.indexOf(e.id) > -1
    );
  }, [getEmployees, activeConversation]);

  if (!activeConversation) {
    return null;
  }

  return (
    <Modal
      {...props}
      title={t("Details")}
      footer={
        locationAccessKey.role <= RoleAccessLevels.GENERAL_MANAGER && [
          <Button
            icon={<EditOutlined />}
            type="dashed"
            onClick={onEdit}
            key="edit"
          >
            {t("Edit Conversation")}
          </Button>,
          <Button
            icon={<DeleteOutlined />}
            type="dashed"
            danger
            onClick={deleteConv}
            key="delete"
          >
            {t("Delete")}
          </Button>,
        ]
      }
    >
      <List>
        <List.Item>
          <List.Item.Meta
            avatar={<FormOutlined />}
            title={t("Name")}
            description={activeConversation.name}
          />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            avatar={
              activeConversation.privacyLevel === PrivacyLevel.PRIVATE ? (
                <LockOutlined />
              ) : activeConversation.privacyLevel === PrivacyLevel.POSITIONS ? (
                <TagsOutlined />
              ) : (
                <GlobalOutlined />
              )
            }
            title={t("Privacy Level")}
            description={t(
              privacyLevelToString(activeConversation.privacyLevel)
            )}
          />
        </List.Item>
        {Boolean(admins.length) && (
          <List.Item>
            <List.Item.Meta
              avatar={<CrownOutlined />}
              title={t("Admins")}
              description={admins.map((admin) => (
                <p key={admin.id}>{admin.fullName}</p>
              ))}
            />
          </List.Item>
        )}
        <List.Item>
          <List.Item.Meta
            avatar={<InfoCircleOutlined />}
            title={t("Description")}
            description={
              activeConversation.description
                ? activeConversation.description
                : "---"
            }
          />
        </List.Item>
        {activeConversation.privacyLevel === PrivacyLevel.PRIVATE && (
          <List.Item>
            <List.Item.Meta
              avatar={<TeamOutlined />}
              title={t("Members")}
              description={activeConversation.members?.length ?? 0}
            />
          </List.Item>
        )}

        {activeConversation.privacyLevel === PrivacyLevel.POSITIONS &&
          Boolean(activeConversation.position) && (
            <List.Item>
              <List.Item.Meta
                avatar={<TagOutlined />}
                title={t("Position")}
                description={activeConversation.position}
              />
            </List.Item>
          )}
        <Divider />
        <List.Item
          hidden={!activeConversation.iAmMember}
          extra={
            <Switch
              checked={activeConversation.isMuted}
              onChange={() => {
                activeConversation.toggleMuteChat();
              }}
            />
          }
        >
          <List.Item.Meta
            avatar={<NotificationOutlined />}
            title={t("Mute push notifications")}
          />
        </List.Item>
      </List>
    </Modal>
  );
}

export default ConvDetails;
