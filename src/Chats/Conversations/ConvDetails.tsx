/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Modal, ModalProps } from "antd";
import { useTranslation } from "react-i18next";
import { List } from "antd";
import {
  FormOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
  LockOutlined,
  ShopOutlined,
  TagOutlined,
  TagsOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useConversations } from "@cuttinboard-solutions/cuttinboard-library";
import {
  PrivacyLevel,
  privacyLevelToString,
} from "@cuttinboard-solutions/types-helpers";

function ConvDetails(props: ModalProps) {
  const { activeConversation } = useConversations();
  if (!activeConversation) {
    throw new Error("No active message board");
  }
  const { t } = useTranslation();

  return (
    <Modal {...props} title={t("Details")} footer={null}>
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
            avatar={<ShopOutlined />}
            title={t("Location")}
            description={activeConversation.locationName}
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
            title={t("Membership Type")}
            description={t(
              privacyLevelToString(activeConversation.privacyLevel)
            )}
          />
        </List.Item>
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
              description={Object.keys(activeConversation.members).length}
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
      </List>
    </Modal>
  );
}

export default ConvDetails;
