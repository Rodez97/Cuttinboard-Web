/** @jsx jsx */
import { jsx } from "@emotion/react";
import dayjs from "dayjs";
import { useCallback, useMemo } from "react";
import { Button, Divider, Modal, Tag } from "antd";
import relativeTime from "dayjs/plugin/relativeTime";
import { DeleteFilled } from "@ant-design/icons";
import MessageElement from "./MessageElement";
import {
  useCuttinboard,
  useMessages,
} from "@cuttinboard-solutions/cuttinboard-library";
import {
  GroupContent,
  GroupHeadingContainer,
  MainMessageContainer,
  MessageContent,
  MessageWrap,
} from "./MessageContent";
import { GroupHeadingAvatar } from "./GroupHeadingAvatar";
import { GroupHeadingText } from "./GroupHeadingText";
import { useTranslation } from "react-i18next";
import useMessageUtils from "./useMessageUtils";
import AttachmentElement from "./AttachmentElement";
import { ImageMessage } from "./MessageElements";
import {
  IMessage,
  parseMediaFromText,
} from "@cuttinboard-solutions/types-helpers";
dayjs.extend(relativeTime);

interface DirectMessageBubbleProps {
  prevMessage?: IMessage;
  currentMessage: IMessage;
  canUse?: boolean;
}

function DirectMessageBubble({
  prevMessage,
  currentMessage,
  canUse,
}: DirectMessageBubbleProps) {
  const { t } = useTranslation();
  const { user } = useCuttinboard();
  const { showSender, showDate } = useMessageUtils(currentMessage, prevMessage);
  const { removeMessage } = useMessages();

  const deleteMessage = useCallback(() => {
    // Confirm delete
    Modal.confirm({
      title: t("Are you sure you want to delete this message?"),
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        removeMessage(currentMessage);
      },
    });
  }, [currentMessage, removeMessage, t]);

  const parsedMedia = useMemo(
    () =>
      currentMessage.text ? parseMediaFromText(currentMessage.text) : null,
    [currentMessage]
  );

  return (
    <MainMessageContainer
      css={{
        marginTop: showSender || showDate ? 10 : 0,
      }}
    >
      {showDate && (
        <Divider plain>
          <Tag>
            {dayjs(currentMessage.createdAt).format("MM/DD/YYYY h:mm A")}
          </Tag>
        </Divider>
      )}

      <MessageWrap>
        <MessageContent>
          <GroupHeadingAvatar
            showAvatar={Boolean(showSender || showDate)}
            avatar={currentMessage.user.avatar || undefined}
            userId={currentMessage.user._id}
          />

          <GroupHeadingContainer>
            {(showSender || showDate) && (
              <GroupHeadingText
                name={currentMessage.user.name}
                createdAtDate={dayjs(currentMessage.createdAt)}
              />
            )}

            <GroupContent>
              <div
                css={{
                  flex: 1,
                }}
              >
                {currentMessage.image ? (
                  <ImageMessage src={currentMessage.image} />
                ) : parsedMedia !== null ? (
                  <AttachmentElement
                    contentType={parsedMedia[0].type}
                    sourceUrl={parsedMedia[0].url}
                  />
                ) : null}

                <MessageElement message={currentMessage.text} />
              </div>
            </GroupContent>
          </GroupHeadingContainer>
        </MessageContent>
        {canUse && user.uid === currentMessage.user._id && (
          <Button
            onClick={deleteMessage}
            danger
            icon={<DeleteFilled />}
            className="optionsBtn"
          />
        )}
      </MessageWrap>
    </MainMessageContainer>
  );
}

export default DirectMessageBubble;
