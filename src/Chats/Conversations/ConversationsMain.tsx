/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import ChatMain from "../components/ChatMain";
import { Button, Layout } from "antd";
import { InfoCircleOutlined, TeamOutlined } from "@ant-design/icons";
import ConvDetails from "./ConvDetails";
import ManageConvDialog, { useManageConvs } from "./ManageConvDialog";
import ConvManageMembers from "./ConvManageMembers";
import {
  useCuttinboard,
  useCuttinboardLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  MessagesProvider,
  useConversations,
} from "@cuttinboard-solutions/cuttinboard-library/chats";
import { useDisclose } from "@cuttinboard-solutions/cuttinboard-library/utils";
import { GrayPageHeader } from "../../shared";

function ConversationsMain() {
  const { t } = useTranslation();
  const { notifications } = useCuttinboard();
  const { location } = useCuttinboardLocation();
  const { activeConversation, canUse } = useConversations();
  const [infoOpen, openInfo, closeInfo] = useDisclose();
  const { baseRef, editConv } = useManageConvs();
  const [manageMembersOpen, openManageMembers, closeManageMembers] =
    useDisclose();

  useEffect(() => {
    return () => {
      activeConversation &&
        notifications &&
        notifications.removeConversationBadges(
          location.organizationId,
          location.id,
          activeConversation.id
        );
    };
  }, [location.id, location.organizationId, notifications, activeConversation]);

  if (!activeConversation) {
    return null;
  }

  return (
    <Layout.Content
      css={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <MessagesProvider chatId={activeConversation.id} type="conversation">
        <GrayPageHeader
          backIcon={<InfoCircleOutlined />}
          onBack={openInfo}
          title={activeConversation.name}
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
          chatId={activeConversation.id}
          canUse={canUse}
        />

        <ConvDetails
          open={infoOpen}
          onCancel={closeInfo}
          onEdit={() => {
            closeInfo();
            editConv(activeConversation);
          }}
        />
        <ManageConvDialog ref={baseRef} />
        <ConvManageMembers
          open={manageMembersOpen}
          onCancel={closeManageMembers}
        />
      </MessagesProvider>
    </Layout.Content>
  );
}

export default ConversationsMain;
