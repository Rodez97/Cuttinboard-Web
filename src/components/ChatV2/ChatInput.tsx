/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { nanoid } from "nanoid";
import { useChatRTDB } from "@cuttinboard/cuttinboard-library/services";
import { Message, MessageType } from "@cuttinboard/cuttinboard-library/models";
import { Colors } from "@cuttinboard/cuttinboard-library/utils";
import {
  Button,
  Dropdown,
  Input,
  InputRef,
  message,
  Typography,
  Upload,
  UploadProps,
} from "antd";
import {
  CloseOutlined,
  FileFilled,
  PaperClipOutlined,
  SendOutlined,
  SmileFilled,
} from "@ant-design/icons";
import Picker from "emoji-picker-react";
import { GrayPageHeader } from "../PageHeaders";
import { recordError } from "../../utils/utils";

interface ChatInputProps {
  replyTargetMessage?: Message & { type: MessageType };
  onSendMessage: () => void;
  cancelReply: () => void;
}

function ChatInput({
  onSendMessage,
  replyTargetMessage,
  cancelReply,
}: ChatInputProps) {
  const { sendMessage, attachFiles } = useChatRTDB();
  const [messageTxt, setMessageTxt] = useState("");
  const inputRef = useRef<InputRef>(null);
  const [sendingAttachment, setSendingAttachment] = useState(false);
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<{
    dataURL: string | ArrayBuffer;
    file: File;
    name: string;
    mimeType: string;
    isImage?: boolean;
  }>(null);

  const submitMessage = () => {
    if (!messageTxt && !selectedFile) {
      return;
    }
    if (messageTxt.length >= 2000) {
      message.error(t("You've surpassed the 2000 character limit"));
      return;
    }
    if (selectedFile) {
      uploadFile();
      setSelectedFile(null);
    } else {
      const messageTextContent = messageTxt.trim();
      setMessageTxt("");
      sendMessage(messageTextContent, replyTargetMessage);
    }
    onSendMessage();
  };

  const uploadFile = async () => {
    if (selectedFile === null) {
      return;
    }
    setSendingAttachment(true);
    try {
      await attachFiles(
        selectedFile.file,
        selectedFile.name,
        selectedFile.mimeType,
        Boolean(messageTxt) && messageTxt.trim(),
        replyTargetMessage
      );
    } catch (error) {
      recordError(error);
    }
    setSendingAttachment(false);
  };

  useEffect(() => {
    if (replyTargetMessage) {
      inputRef.current?.focus();
    }
  }, [replyTargetMessage]);

  const props: UploadProps = {
    name: "file",
    beforeUpload: async (file) => {
      if (file.size > 8_000_000) {
        message.error(t("Your file surpasses the 8mb limit."));
        return false;
      }

      const dataURL = await new Promise<string | ArrayBuffer>((resolve) => {
        const reader = new FileReader();
        reader.addEventListener(
          "load",
          () => {
            resolve(reader.result);
          },
          false
        );
        if (file) {
          reader.readAsDataURL(file);
        }
      });

      setSelectedFile({
        dataURL,
        file,
        name: file.name,
        mimeType: file.type,
        isImage: file.type.includes("image"),
      });
      setMessageTxt("");
      return false;
    },
    multiple: false,
    fileList: [],
  };

  return (
    <React.Fragment>
      {replyTargetMessage && (
        <GrayPageHeader
          css={{ border: "1px solid #00000025" }}
          title={t("Replying to {{0}}", {
            0: replyTargetMessage.sender?.name,
          })}
          extra={[<CloseOutlined key="close" onClick={cancelReply} />]}
        >
          <Typography.Paragraph>
            {replyTargetMessage.message}
          </Typography.Paragraph>
        </GrayPageHeader>
      )}
      {selectedFile && (
        <GrayPageHeader
          css={{ border: "1px solid #00000025" }}
          title={selectedFile.name}
          extra={[
            <CloseOutlined
              key="close"
              onClick={() => setSelectedFile(null)}
              disabled={sendingAttachment}
            />,
          ]}
          avatar={{
            shape: "square",
            size: 70,
            src: selectedFile.dataURL as string,
            icon: <FileFilled />,
          }}
        />
      )}
      <div
        css={{
          padding: "20px 10px",
          backgroundColor: Colors.MainOnWhite,
          display: "flex",
          gap: 16,
        }}
      >
        <Upload {...props}>
          <Button
            icon={
              <PaperClipOutlined
                css={{ color: Colors.Green.Main, fontSize: 20 }}
              />
            }
            disabled={sendingAttachment}
            type="text"
          />
        </Upload>

        <Dropdown
          overlay={
            <Picker
              onEmojiClick={(_, { emoji }) =>
                setMessageTxt(`${messageTxt} ${emoji}`)
              }
            />
          }
        >
          <Button
            icon={<SmileFilled css={{ color: "#FFCC33", fontSize: 20 }} />}
            disabled={sendingAttachment}
            type="text"
          />
        </Dropdown>

        <Input
          maxLength={2000}
          showCount
          placeholder={t("Type a message...")}
          css={{
            backgroundColor: "white",
            width: "100%",
          }}
          value={messageTxt}
          onChange={(e) => setMessageTxt(e.target.value)}
          ref={inputRef}
          disabled={sendingAttachment}
          onKeyDown={(e) => {
            if (e.code === "Enter") {
              e.preventDefault();
              submitMessage();
            }
          }}
        />
        <Button
          icon={<SendOutlined css={{ color: Colors.MainBlue, fontSize: 20 }} />}
          loading={sendingAttachment}
          onClick={submitMessage}
          type="text"
        />
      </div>
    </React.Fragment>
  );
}

export default ChatInput;
