/** @jsx jsx */
import {
  useConversations,
  useEmployeesList,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
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
import { getPrivacyLevelTextByNumber, recordError } from "../../utils/utils";
import {
  PrivacyLevel,
  RoleAccessLevels,
} from "@cuttinboard-solutions/cuttinboard-library/utils";

function ConvDetails({
  onEdit,
  ...props
}: ModalProps & { onEdit: () => void }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { selectedConversation, canManage } = useConversations();
  const { locationAccessKey } = useLocation();
  const { getEmployees } = useEmployeesList();

  const deleteConv = useCallback(async () => {
    if (!canManage) {
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
          await selectedConversation.delete();
          navigate(-1);
        } catch (error) {
          recordError(error);
        }
      },
    });
  }, [selectedConversation]);

  const admins = useMemo(() => {
    if (!Boolean(selectedConversation.hosts?.length)) {
      return [];
    }
    return getEmployees.filter(
      (e) => selectedConversation.hosts.indexOf(e.id) > -1
    );
  }, [getEmployees, selectedConversation]);

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
            ) : selectedConversation.privacyLevel === PrivacyLevel.POSITIONS ? (
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
      {Boolean(admins.length) && (
        <List.Item>
          <List.Item.Meta
            avatar={<CrownOutlined />}
            title={t("Admins")}
            description={admins.map((admin) => (
              <p>{admin.fullName}</p>
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
    </Modal>
  );
}

export default ConvDetails;
