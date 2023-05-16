/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import InfiniteScroll from "react-infinite-scroll-component";
import ChatInput from "./ChatInput";
import { Button, Layout, Typography } from "antd";
import MessageBubble from "./MessageBubble";
import { useMessages } from "@cuttinboard-solutions/cuttinboard-library";
import { INITIAL_LOAD_SIZE } from "../ChatConstants";
import { LoadingPage } from "../../shared";
import ErrorPage from "../../shared/molecules/PageError";

interface ChatMainProps {
  canUse?: boolean;
  type: "dm" | "mb";
}

const ChatMain = ({ canUse, type }: ChatMainProps) => {
  const { t } = useTranslation();
  const { messages, noMoreMessages, fetchPreviousMessages, loading, error } =
    useMessages();
  const infiniteScrollRef = useRef<InfiniteScroll>(null);
  const [loadingMore, setLoadingMore] = useState(false);

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

  const handleLoadMore = useCallback(() => {
    setLoadingMore(true);
    fetchPreviousMessages().finally(() => {
      setLoadingMore(false);
    });
  }, [fetchPreviousMessages]);

  return (
    <React.Fragment>
      <div
        css={{
          position: "relative",
        }}
      >
        {canUse && <ChatInput onMessageSend={handleNewMessage} />}
      </div>
      {loading ? (
        <LoadingPage />
      ) : error ? (
        <ErrorPage error={error} />
      ) : (
        <Layout.Content id="scrollable">
          <div
            css={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {messages?.map((rm) => (
              <MessageBubble
                key={rm._id}
                currentMessage={rm}
                canUse={canUse}
                type={type}
              />
            ))}
            {!noMoreMessages && messages.length >= INITIAL_LOAD_SIZE ? (
              <Button
                onClick={handleLoadMore}
                css={{
                  margin: "20px auto",
                  alignSelf: "center",
                }}
                type="link"
                loading={loadingMore}
              >
                {t("Load more")}
              </Button>
            ) : (
              <Typography.Text
                type="secondary"
                css={{
                  margin: "20px auto",
                  textAlign: "center",
                }}
              >
                {t("This is the beginning of the message history")}
              </Typography.Text>
            )}
          </div>
        </Layout.Content>
      )}
    </React.Fragment>
  );
};

export default ChatMain;
