/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
import MessageBubble from "components/ChatV2/MessageBubble";
import ChatInput from "components/ChatV2/ChatInput";
import {
  Message,
  MessageType,
} from "@cuttinboard-solutions/cuttinboard-library/models";
import dayjs from "dayjs";
import { Divider, Layout, Space, Spin, Typography } from "antd";
import PageLoading from "../PageLoading";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import {
  useDirectMessages,
  useConversationMessages,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import DirectMessageBubble from "./DirectMessageBubble";

interface ChatMainProps {
  type: "chats" | "conversations";
  chatId: string;
  canUse?: boolean;
}

function ChatMain({ type, chatId, canUse }: ChatMainProps) {
  const { t } = useTranslation();
  const { fetchOlderMessages, allMessages, noMoreMessages, loading } =
    type === "chats" ? useDirectMessages() : useConversationMessages();
  const [replyTargetMessage, setReplyTargetMessage] = useState<Message>(null);

  useEffect(() => {
    setReplyTargetMessage(null);
  }, [chatId]);

  if (loading) {
    return <PageLoading />;
  }

  return (
    <React.Fragment>
      <Layout.Content
        id="scrollableDiv"
        css={{
          height: "100%",
          overflow: "auto",
          display: "flex",
          flexDirection: "column-reverse",
          paddingY: 2,
          paddingX: 1,
        }}
      >
        {/*Put the scroll bar always on the bottom*/}
        <InfiniteScroll
          dataLength={allMessages?.length}
          next={fetchOlderMessages}
          css={{
            display: "flex",
            flexDirection: "column-reverse",
            overflow: "hidden",
          }} //To put endMessage and loader to the top.
          inverse={true} //
          hasMore={!noMoreMessages}
          loader={
            allMessages.length > 0 && (
              <div
                css={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 1,
                }}
              >
                <Spin />
              </div>
            )
          }
          scrollableTarget="scrollableDiv"
        >
          {allMessages?.map((rm, index) =>
            rm.type === "system" ? (
              <div
                key={rm.id}
                css={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px",
                  marginTop: "10px",
                }}
              >
                <Typography.Text type="secondary" css={{ fontSize: 18 }}>
                  {t("The conversation starts here 😉")}
                </Typography.Text>
                <Divider plain>
                  {rm.createdAtDate.format("MM/DD/YYYY, h:mm a")}
                </Divider>
              </div>
            ) : type === "chats" ? (
              <DirectMessageBubble
                key={rm.id}
                prevMessage={allMessages[index + 1]}
                currentMessage={rm}
                i={index}
                allMessagesLength={allMessages?.length}
                onReply={setReplyTargetMessage}
              />
            ) : (
              <MessageBubble
                key={rm.id}
                prevMessage={allMessages[index + 1]}
                currentMessage={rm}
                i={index}
                allMessagesLength={allMessages?.length}
                onReply={setReplyTargetMessage}
                canUseApp={canUse}
              />
            )
          )}
        </InfiniteScroll>
      </Layout.Content>
      {canUse ? (
        <ChatInput
          onSendMessage={() => setReplyTargetMessage(null)}
          replyTargetMessage={replyTargetMessage}
          cancelReply={() => setReplyTargetMessage(null)}
          type={type}
        />
      ) : (
        <Space
          css={{
            display: "flex",
            justifyContent: "center",
            backgroundColor: Colors.MainOnWhite,
            padding: "20px",
          }}
        >
          <Typography.Text type="secondary" css={{ fontSize: 18 }}>
            {t(
              "You can't participate in this conversation because you are not a member 🤐"
            )}
          </Typography.Text>
        </Space>
      )}
    </React.Fragment>
  );
}
export default ChatMain;
