/** @jsx jsx */
import { jsx } from "@emotion/react";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import MessageReactionPicker from "components/ChatV2/MessageReactionPicker";
import { Message } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Auth } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import {
  useConversationMessages,
  useConversations,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { Avatar, Button, Divider, Tooltip, Typography } from "antd";
import mdiArrowDownLeft from "@mdi/svg/svg/arrow-down-left.svg";
import mdiReply from "@mdi/svg/svg/reply.svg";
import relativeTime from "dayjs/plugin/relativeTime";
import styled from "@emotion/styled";
import Icon, { DeleteFilled, UserOutlined } from "@ant-design/icons";
import MessageElement from "./MessageElement";
import MessageReactionsElement from "./MessageReactionsElement";
import { getAvatarByUID } from "utils/utils";
dayjs.extend(relativeTime);

const MessageContent = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  padding: 5px;
  padding-bottom: 0px;
  width: 100%;
  position: relative;
  align-items: center;
`;

const MessageWrap = styled.div`
  width: 100%;
  position: relative;
  & .optionsBtn {
    visibility: hidden;
    opacity: 0;
    position: absolute;
    right: 15px;
    top: -25px;
    z-index: 20;
    transition: visibility 0s, opacity 0.5s linear;
  }
  :hover {
    background-color: #00000010;
    & .optionsBtn {
      visibility: visible;
      opacity: 1;
    }
  }
`;

interface MessageBubbleProps {
  prevMessage?: Message;
  currentMessage?: Message & {
    type: "attachment" | "youtube" | "mediaUri" | "text";
  };
  i: number;
  allMessagesLength: number;
  onReply: (
    message: Message & { type: "attachment" | "youtube" | "mediaUri" | "text" }
  ) => void;
  canUseApp?: boolean;
}

function MessageBubble({
  prevMessage,
  currentMessage,
  i = 0,
  allMessagesLength,
  onReply,
  canUseApp,
}: MessageBubbleProps) {
  const { deleteMessage } = useConversationMessages();
  const { selectedChat } = useConversations();

  const handleReplyMsg = () => {
    onReply(currentMessage);
  };

  const showAvatar = useMemo(
    () =>
      prevMessage?.type === "system" ||
      i === allMessagesLength - 2 ||
      (prevMessage && prevMessage?.sender?.id !== currentMessage.sender?.id),
    [prevMessage, allMessagesLength, currentMessage]
  );

  const showDate = useMemo(
    () =>
      prevMessage &&
      (i === allMessagesLength - 1 ||
        dayjs(currentMessage.createdAt).diff(
          dayjs(prevMessage?.createdAt),
          "hours"
        ) > 5 ||
        dayjs(currentMessage.createdAt).day() !==
          dayjs(prevMessage?.createdAt).day()),
    [prevMessage, currentMessage, allMessagesLength]
  );

  const replySender = () => {
    if (!currentMessage.replyTarget) {
      return null;
    }
    const [rsId, rsName] = selectedChat.members.find(
      ([id]) => id === currentMessage.replyTarget.sender.id
    );
    return {
      id: rsId,
      name: rsName,
      avatar: getAvatarByUID(rsId),
    };
  };

  const avatar = getAvatarByUID(currentMessage.sender.id);

  return (
    <div
      css={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "2px 5px",
      }}
    >
      {showDate && (
        <Divider plain>
          {dayjs(currentMessage.createdAt).format("MM/DD/YYYY, h:mm a")}
        </Divider>
      )}

      <MessageWrap>
        {currentMessage.replyTarget && (
          <MessageContent>
            <div
              css={{
                width: 40,
                alignSelf: "flex-end",
                justifyContent: "flex-end",
                display: "flex",
              }}
            >
              <Icon component={mdiArrowDownLeft} />
            </div>
            <MessageContent css={{ border: "1px dotted #00000050" }}>
              <div css={{ width: 20, alignSelf: "flex-start" }}>
                <Avatar
                  size={20}
                  src={replySender().avatar}
                  alt={replySender().name}
                  icon={<UserOutlined />}
                />
              </div>
              <div
                css={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                <Typography.Text css={{ margin: "0px 2px", fontSize: "1rem" }}>
                  {replySender().name}
                  <Tooltip
                    placement="top"
                    title={dayjs(currentMessage.replyTarget.createdAt).format(
                      "MM/DD/YYYY, h:mm a"
                    )}
                  >
                    <Typography.Text
                      css={{
                        fontSize: "0.75rem",
                        marginLeft: "0.50rem",
                        color: "#00000070",
                      }}
                    >
                      {dayjs(currentMessage.replyTarget.createdAt).fromNow()}
                    </Typography.Text>
                  </Tooltip>
                </Typography.Text>

                <MessageElement targetMsg={currentMessage.replyTarget} />
              </div>
            </MessageContent>
          </MessageContent>
        )}
        <MessageContent
          css={{ paddingTop: currentMessage.replyTarget ? 0 : 1 }}
        >
          <div
            css={{
              width: 40,
              alignSelf: "flex-start",
              justifyContent: "flex-end",
              display: "flex",
            }}
          >
            {(showAvatar || showDate || currentMessage.replyTarget) && (
              <Avatar size={40} src={avatar} icon={<UserOutlined />} />
            )}
          </div>

          <div
            css={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
            }}
          >
            {(showAvatar || showDate || currentMessage.replyTarget) && (
              <Typography.Text css={{ margin: "0px 2px", fontSize: "1rem" }}>
                {currentMessage.sender?.name}
                <Tooltip
                  placement="top"
                  title={dayjs(currentMessage.createdAt).format(
                    "MM/DD/YYYY, h:mm a"
                  )}
                >
                  <Typography.Text
                    css={{
                      fontSize: "0.75rem",
                      marginLeft: "0.50rem",
                      color: "#00000070",
                    }}
                  >
                    {dayjs(currentMessage.createdAt).fromNow()}
                  </Typography.Text>
                </Tooltip>
              </Typography.Text>
            )}

            <div
              css={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
                padding: 7,
              }}
            >
              <MessageElement targetMsg={currentMessage} />
            </div>
            <MessageReactionsElement reactions={currentMessage.reactions} />
          </div>
        </MessageContent>
        {canUseApp && (
          <Button.Group className="optionsBtn">
            <Button
              onClick={handleReplyMsg}
              icon={<Icon component={mdiReply} />}
            />
            <MessageReactionPicker
              messageId={currentMessage.id}
              haveUserReaction={Boolean(
                currentMessage.reactions?.[Auth.currentUser.uid]
              )}
              isChat={false}
            />
            {Auth.currentUser.uid === currentMessage?.sender?.id && (
              <Button
                onClick={() => deleteMessage(currentMessage.id)}
                danger
                icon={<DeleteFilled />}
              />
            )}
          </Button.Group>
        )}
      </MessageWrap>
    </div>
  );
}

export default React.memo(MessageBubble);
