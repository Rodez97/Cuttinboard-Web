/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useConversationMessages,
  useDirectMessages,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { Message } from "@cuttinboard-solutions/cuttinboard-library/models";
import { Colors } from "@cuttinboard-solutions/cuttinboard-library/utils";
import {
  Button,
  Input,
  InputRef,
  message,
  Popover,
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
import { recordError } from "../utils/utils";
import {
  Auth,
  Storage,
} from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { GrayPageHeader } from "../components";

interface ChatInputProps {
  replyTargetMessage?: Message;
  onSendMessage: () => void;
  cancelReply: () => void;
  type: "chats" | "conversations";
}

function ChatInput({
  onSendMessage,
  replyTargetMessage,
  cancelReply,
  type,
}: ChatInputProps) {
  const { sendMessage, getAttachmentRefPath } =
    type === "chats" ? useDirectMessages() : useConversationMessages();
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

  const submitMessage = async () => {
    if (!messageTxt && !selectedFile) {
      return;
    }
    if (messageTxt.length >= 2000) {
      message.error(t("You've surpassed the 2000 character limit"));
      return;
    }
    const messageTextContent = messageTxt.trim();
    setMessageTxt("");
    if (selectedFile) {
      setSendingAttachment(true);
      const attachmentData = await uploadFile();
      sendMessage(messageTextContent, replyTargetMessage, attachmentData);
      setSelectedFile(null);
      setSendingAttachment(false);
    } else {
      sendMessage(messageTextContent, replyTargetMessage);
    }
    onSendMessage();
  };

  const uploadFile = async (): Promise<{
    downloadUrl: string;
    fileName: string;
    mimeType: string;
    storageSourcePath: string;
  }> => {
    try {
      const refPath = getAttachmentRefPath(selectedFile.name);
      const fileRef = ref(Storage, refPath);

      const uploadRef = await uploadBytes(fileRef, selectedFile.file, {
        contentType: selectedFile.mimeType,
        customMetadata: {
          senderId: Auth.currentUser.uid,
          senderName: Auth.currentUser.displayName,
        },
      });

      const downloadUrl = await getDownloadURL(uploadRef.ref);

      return {
        downloadUrl,
        fileName: selectedFile.name,
        mimeType: selectedFile.mimeType,
        storageSourcePath: refPath,
      };
    } catch (error) {
      recordError(error);
      throw error;
    }
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

        <Popover
          content={
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
        </Popover>

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
