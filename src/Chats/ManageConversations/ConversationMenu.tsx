import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  FormOutlined,
  InfoCircleOutlined,
  MoreOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useConversations } from "@cuttinboard-solutions/cuttinboard-library";
import { IConversation } from "@cuttinboard-solutions/types-helpers";
import { Button, Dropdown, Modal } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";

interface ConversationMenuProps {
  conversation: IConversation;
  onEdit: (conversation: IConversation) => void;
  onViewMessageHistory: (conversation: IConversation) => void;
  onManageMembers: (conversation: IConversation) => void;
}

export default ({
  conversation,
  onEdit,
  onViewMessageHistory,
  onManageMembers,
}: ConversationMenuProps) => {
  const { t } = useTranslation();
  const { deleteConversation } = useConversations();

  const handleDelete = async () => {
    Modal.confirm({
      title: t("Delete Conversation"),
      content: t("Are you sure you want to delete this conversation?"),
      okText: t("Delete"),
      okType: "danger",
      cancelText: t("Cancel"),
      onOk: () => {
        deleteConversation(conversation);
      },
    });
  };

  const showDescription = () => {
    if (!conversation.description) {
      return;
    }
    Modal.info({
      title: t("Description"),
      content: conversation.description,
      okText: t("Ok"),
    });
  };

  return (
    <React.Fragment>
      <Dropdown
        menu={{
          items: [
            {
              label: t("Details"),
              key: "details",
              icon: <InfoCircleOutlined />,
              onClick: (e) => {
                e.domEvent.stopPropagation();
                showDescription();
              },
              style: { display: conversation.description ? "block" : "none" },
            },
            {
              label: t("Members"),
              key: "members",
              icon: <TeamOutlined />,
              onClick: (e) => {
                e.domEvent.stopPropagation();
                onManageMembers(conversation);
              },
            },
            {
              label: t("View message history"),
              key: "viewMessageHistory",
              icon: <ExclamationCircleOutlined />,
              onClick: (e) => {
                e.domEvent.stopPropagation();
                onViewMessageHistory(conversation);
              },
            },

            {
              label: t("Edit"),
              key: "edit",
              icon: <FormOutlined />,
              onClick: (e) => {
                e.domEvent.stopPropagation();
                onEdit(conversation);
              },
            },
            {
              label: t("Delete"),
              key: "delete",
              icon: <DeleteOutlined />,
              danger: true,
              onClick: (e) => {
                e.domEvent.stopPropagation();
                handleDelete();
              },
            },
          ],
        }}
        trigger={["click"]}
      >
        <Button
          type="text"
          icon={<MoreOutlined />}
          onClick={(e) => {
            e.stopPropagation();
          }}
        />
      </Dropdown>
    </React.Fragment>
  );
};
