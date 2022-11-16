/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ChatMain from "../../ChatComponents/ChatMain";
import {
  ConversationMessagesProvider,
  useConversations,
  useNotificationsBadges,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { Button, Layout } from "antd";
import { GrayPageHeader } from "../../components/PageHeaders";
import { InfoCircleOutlined, TeamOutlined } from "@ant-design/icons";
import { useDisclose } from "../../hooks";
import ConvDetails from "./ConvDetails";
import ManageConvDialog, { useManageConvs } from "./ManageConvDialog";
import ConvManageMembers from "./ConvManageMembers";

function ConversationsMain() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { removeBadge } = useNotificationsBadges();
  const { selectedConversation, canUse } = useConversations();
  const [infoOpen, openInfo, closeInfo] = useDisclose();
  const { baseRef, editConv } = useManageConvs();
  const [manageMembersOpen, openManageMembers, closeManageMembers] =
    useDisclose();

  useEffect(() => {
    removeBadge("conv", selectedConversation.id);
    return () => {
      removeBadge("conv", selectedConversation.id);
    };
  }, [selectedConversation]);

  return (
    <Layout.Content
      css={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <ConversationMessagesProvider chatId={selectedConversation.id}>
        <GrayPageHeader
          backIcon={<InfoCircleOutlined />}
          onBack={openInfo}
          title={selectedConversation.name}
          extra={[
            <Button
              key="members"
              type="primary"
              onClick={openManageMembers}
              icon={<TeamOutlined />}
            >
              {t("Members")}
            </Button>,
          ]}
        />
        <ChatMain
          type="conversations"
          chatId={selectedConversation.id}
          canUse={canUse}
        />

        <ConvDetails
          open={infoOpen}
          onCancel={closeInfo}
          onEdit={() => {
            closeInfo();
            editConv(selectedConversation);
          }}
        />
        <ManageConvDialog ref={baseRef} />
        <ConvManageMembers
          open={manageMembersOpen}
          onCancel={closeManageMembers}
        />
      </ConversationMessagesProvider>
    </Layout.Content>
  );
}

export default ConversationsMain;
