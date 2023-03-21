/** @jsx jsx */
import { jsx } from "@emotion/react";
import { memo, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import ChatMain from "../components/ChatMain";
import { Button, Layout } from "antd";
import { InfoCircleOutlined, TeamOutlined } from "@ant-design/icons";
import ConvDetails from "./ConvDetails";
import ConvManageMembers from "./ConvManageMembers";
import {
  MessagesProvider,
  useDisclose,
  useNotifications,
} from "@cuttinboard-solutions/cuttinboard-library";
import { GrayPageHeader, LoadingPage } from "../../shared";
import { useParams } from "react-router-dom";
import { IConversation } from "@cuttinboard-solutions/types-helpers";

function ConversationsMain({
  activeConversation,
  canUse,
}: {
  activeConversation: IConversation;
  canUse: boolean;
}) {
  const { locationId } = useParams();
  const { t } = useTranslation();
  const [infoOpen, openInfo, closeInfo] = useDisclose();
  const [membersOpen, openMembers, closeMembers] = useDisclose();
  const { removeConversationBadges } = useNotifications();

  useEffect(() => {
    removeConversationBadges(activeConversation.id);
  }, [activeConversation.id, removeConversationBadges]);

  const showMembers = useMemo(
    () => Boolean(locationId && activeConversation.locationId === locationId),
    [activeConversation.locationId, locationId]
  );

  return (
    <Layout.Content
      css={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <MessagesProvider
        LoadingRenderer={<LoadingPage />}
        messagingType={{
          type: "conversation",
          chatId: activeConversation.id,
        }}
        batchSize={20}
        initialLoadSize={50}
      >
        <GrayPageHeader
          backIcon={<InfoCircleOutlined />}
          onBack={openInfo}
          title={activeConversation.name}
          subTitle={activeConversation.locationName}
          extra={
            showMembers && (
              <Button
                key="members"
                type="primary"
                onClick={openMembers}
                icon={<TeamOutlined />}
              >
                {t("Members")}
              </Button>
            )
          }
        />
        <ChatMain type="conversations" canUse={canUse} />

        <ConvDetails open={infoOpen} onCancel={closeInfo} />

        {showMembers && (
          <ConvManageMembers open={membersOpen} onCancel={closeMembers} />
        )}
      </MessagesProvider>
    </Layout.Content>
  );
}

export default memo(ConversationsMain);
