/** @jsx jsx */
import { jsx } from "@emotion/react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Input, InputRef, message, Upload } from "antd/es";
import { FileImageOutlined, SendOutlined } from "@ant-design/icons";
import { getDataURLFromFile, recordError } from "../../utils/utils";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  Colors,
  STORAGE,
  useCuttinboard,
  useMessages,
} from "@cuttinboard-solutions/cuttinboard-library";
import EmojiPicker from "./EmojiPicker";
import throttle from "lodash-es/throttle";
import { InputAttachmentElement } from "./InputAttachmentElement";
import imgPlaceholderResultImg from "../../assets/images/placeholder_result_img.png";

export type FileAttachment = {
  file: File;
  name: string;
  mimeType: string;
  dataURL: string;
};

interface ChatInputProps {
  onMessageSend: () => void;
}

function ChatInput({ onMessageSend }: ChatInputProps) {
  const { t } = useTranslation();
  const { user } = useCuttinboard();
  const { submitMessage, getAttachmentFilePath } = useMessages();
  const [messageTxt, setMessageTxt] = useState("");
  const inputRef = useRef<InputRef>(null);
  const [selectedFile, setSelectedFile] = useState<FileAttachment | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  const uploadSelectedFile = useCallback(
    async (messageId: string): Promise<string> => {
      // Return a rejected promise if no file selected
      if (!selectedFile) {
        return Promise.reject("No file selected");
      }

      try {
        // Get file extension and add to new file name if it exists and is not already part of the file name
        const fileExt = selectedFile.name.split(".").pop();
        let newFileName = messageId;
        if (fileExt) {
          newFileName += `.${fileExt}`;
        }

        // Create a reference to the file in storage and upload the selected file
        const refPath = getAttachmentFilePath(newFileName);
        const fileRef = ref(STORAGE, refPath);
        const uploadRef = await uploadBytes(fileRef, selectedFile.file, {
          contentType: selectedFile.mimeType,
          customMetadata: {
            senderId: user.uid,
            senderName: user.displayName ?? "",
          },
        });

        // Get the download URL for the uploaded file
        const downloadUrl = await getDownloadURL(uploadRef.ref);

        return downloadUrl;
      } catch (error) {
        recordError(error);
        message.error(t("There was an error uploading your file."));
        return Promise.reject(error);
      }
    },
    [getAttachmentFilePath, selectedFile, t, user.displayName, user.uid]
  );

  const handleSendMessage = useCallback(async () => {
    // Trim leading and trailing whitespace from message text
    const messageTextContent = messageTxt.trim();
    // Return if there is no message or file to send
    if (!messageTextContent && !selectedFile) {
      return;
    }

    // Show an error if message exceeds 2000 characters
    if (messageTextContent.length >= 2000) {
      message.error(t("You've surpassed the 2000 character limit"));
      return;
    }

    setSendingMessage(true);
    setMessageTxt("");

    try {
      // Send message with file attachment if selected
      if (selectedFile) {
        await submitMessage({
          messageText: messageTextContent,
          uploadAttachment: {
            uploadFn: uploadSelectedFile,
            image: imgPlaceholderResultImg,
          },
        });
      } else {
        await submitMessage({
          messageText: messageTextContent,
        });
      }
    } catch (error) {
      recordError(error);
      message.error(t("There was an error sending your message."));
    } finally {
      setSelectedFile(null);
      onMessageSend();
      setSendingMessage(false);
    }
  }, [
    messageTxt,
    onMessageSend,
    selectedFile,
    submitMessage,
    t,
    uploadSelectedFile,
  ]);

  // Create a throttled version of send so we don't spam the server with requests when the user is typing fast and holding down enter key to send messages quickly (e.g. when pasting a large message).
  const throttledSend = useMemo(
    () => throttle(handleSendMessage, 300),
    [handleSendMessage]
  );

  const handleBeforeFileUpload = useCallback(
    async (file: File) => {
      // Return false if file is not an image
      if (file.type.indexOf("image") === -1) {
        message.error(t("Please select an image file."));
        return false;
      }

      // Return false if file size exceeds 8 MB
      if (file.size > 8e6) {
        message.error(t("Your file surpasses the 8mb limit."));
        return false;
      }

      const dataURL = await getDataURLFromFile(file);

      // Get data URL for file and set it as the selected file
      setSelectedFile({
        file,
        name: file.name,
        mimeType: file.type,
        dataURL: dataURL as string,
      });
      return false;
    },
    [t]
  );

  const handlePasteIntoInput = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>): void => {
      // Get clipboard data
      const clipboardData: DataTransfer | null = e.clipboardData;
      if (clipboardData) {
        // Get the first file in the clipboard
        const files = clipboardData.files;
        if (files.length > 0 && files[0] instanceof File) {
          const file = files[0];
          // Check if file is an image before setting it as the selected file
          if (file.type.indexOf("image") !== -1 && file instanceof File) {
            handleBeforeFileUpload(file);
          }
        }
      }
    },
    [handleBeforeFileUpload]
  );

  const handleEmojiSelected = useCallback(
    (emoji: string): void => {
      setMessageTxt(messageTxt + emoji);
      inputRef.current?.focus();
    },
    [messageTxt]
  );

  return (
    <div
      css={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: 600,
        width: "100%",
        margin: "0 auto",
        padding: "5px",
      }}
    >
      {selectedFile && (
        <InputAttachmentElement
          selectedFile={selectedFile}
          cancelAttachment={() => setSelectedFile(null)}
        />
      )}
      <div
        css={{
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <Input.TextArea
          maxLength={2000}
          autoSize={{ minRows: 2, maxRows: 10 }}
          showCount
          placeholder={t("Type a message...")}
          css={{
            backgroundColor: "transparent",
            width: "100%",
          }}
          value={messageTxt}
          onChange={(e) => setMessageTxt(e.target.value)}
          ref={inputRef}
          onPaste={handlePasteIntoInput}
        />

        <div
          css={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            css={{
              display: "flex",
              gap: 5,
            }}
          >
            <Upload
              name="file"
              beforeUpload={handleBeforeFileUpload}
              multiple={false}
              maxCount={1}
              fileList={[]}
              accept="image/*"
            >
              <Button
                icon={
                  <FileImageOutlined css={{ color: "#74726E", fontSize: 20 }} />
                }
                type="text"
              />
            </Upload>

            <EmojiPicker onSelect={handleEmojiSelected} />
          </div>

          <Button
            icon={
              <SendOutlined css={{ color: Colors.MainBlue, fontSize: 20 }} />
            }
            onClick={throttledSend}
            type="text"
            loading={sendingMessage}
          />
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
