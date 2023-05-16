/** @jsx jsx */
import { jsx } from "@emotion/react";
import { memo, useEffect } from "react";
import ChatMain from "../components/ChatMain";
import { Layout } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import ConvDetails from "./ConvDetails";
import {
  MessagesProvider,
  useDisclose,
  useNotifications,
} from "@cuttinboard-solutions/cuttinboard-library";
import { GrayPageHeader } from "../../shared";
import { IConversation } from "@cuttinboard-solutions/types-helpers";
import { BATCH_SIZE, INITIAL_LOAD_SIZE } from "../ChatConstants";

function ConversationsMain({
  activeConversation,
  canUse,
}: {
  activeConversation: IConversation;
  canUse: boolean;
}) {
  const [infoOpen, openInfo, closeInfo] = useDisclose();
  const { removeConversationBadges } = useNotifications();

  useEffect(() => {
    removeConversationBadges(activeConversation.id);

    return () => {
      removeConversationBadges(activeConversation.id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation.id]);

  return (
    <Layout.Content
      css={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <MessagesProvider
        messagingType={{
          type: "conversation",
          chatId: activeConversation.id,
        }}
        batchSize={BATCH_SIZE}
        initialLoadSize={INITIAL_LOAD_SIZE}
      >
        <GrayPageHeader
          backIcon={<InfoCircleOutlined />}
          onBack={openInfo}
          title={activeConversation.name}
          subTitle={activeConversation.locationName}
        />
        <ChatMain canUse={canUse} type="mb" />

        <ConvDetails open={infoOpen} onCancel={closeInfo} />
      </MessagesProvider>
    </Layout.Content>
  );
}

export default memo(ConversationsMain);
