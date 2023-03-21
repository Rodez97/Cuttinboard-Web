/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
import ChatInput from "./ChatInput";
import { Divider, Spin, Tag, Typography } from "antd";
import DirectMessageBubble from "./DirectMessageBubble";
import { useMessages } from "@cuttinboard-solutions/cuttinboard-library";
import dayjs from "dayjs";

interface ChatMainProps {
  type: "chats" | "conversations";
  canUse?: boolean;
}

const ChatMain = ({ type, canUse }: ChatMainProps) => {
  const { t } = useTranslation();
  const { messages, noMoreMessages, fetchPreviousMessages } = useMessages();
  const infiniteScrollRef = useRef<InfiniteScroll>(null);

  const handleNewMessage = useCallback(() => {
    // Scroll to the bottom of the chat
    const scrollableTarget = infiniteScrollRef.current?.getScrollableTarget();
    if (scrollableTarget) {
      setTimeout(() => {
        scrollableTarget.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 200);
    }
  }, []);

  return (
    <React.Fragment>
      <div
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
          ref={infiniteScrollRef}
          dataLength={messages ? messages.length : 0}
          next={fetchPreviousMessages}
          css={{
            display: "flex",
            flexDirection: "column-reverse",
            overflow: "hidden !important",
          }} //To put endMessage and loader to the top.
          inverse={true} //
          hasMore={!noMoreMessages}
          loader={
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
          }
          scrollableTarget="scrollableDiv"
        >
          {messages?.map((rm, index) =>
            rm.systemType === "start" ? (
              <div
                key={rm._id}
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
                  <Tag>{dayjs(rm.createdAt).format("MM/DD/YYYY h:mm A")}</Tag>
                </Divider>
              </div>
            ) : (
              <DirectMessageBubble
                key={rm._id}
                prevMessage={messages[index + 1]}
                currentMessage={rm}
                canUse={canUse || type === "chats"}
              />
            )
          )}
        </InfiniteScroll>
      </div>

      <div
        css={{
          position: "relative",
        }}
      >
        {canUse && <ChatInput onMessageSend={handleNewMessage} />}
      </div>
    </React.Fragment>
  );
};

{
  /* <Space
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
</Space>; */
}

export default ChatMain;
