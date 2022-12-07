/* eslint-disable react-hooks/exhaustive-deps */
import { ref as storageRef, uploadBytes } from "@firebase/storage";
import React, { useState } from "react";
import fileSize from "filesize";
import { useTranslation } from "react-i18next";
import { message, Modal, Upload, UploadFile, UploadProps } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { recordError } from "../../utils/utils";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { StorageReference } from "firebase/storage";
import {
  useCuttinboard,
  useCuttinboardLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { useBoard } from "@cuttinboard-solutions/cuttinboard-library/boards";
import { nanoid } from "nanoid";
import {
  FIRESTORE,
  STORAGE,
} from "@cuttinboard-solutions/cuttinboard-library/utils";

const { Dragger } = Upload;

type PickFileProps = {
  maxFiles: number;
  maxSize: number;
  baseStorageRef: StorageReference;
  onClose: () => void;
  open: boolean;
};

export default ({
  maxFiles,
  maxSize,
  baseStorageRef,
  onClose,
  open,
}: PickFileProps) => {
  const { t } = useTranslation();
  const { user } = useCuttinboard();
  const { location } = useCuttinboardLocation();
  const { selectedBoard } = useBoard();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const close = () => {
    setFileList([]);
    onClose();
  };

  const handleAccept = () => {
    if (fileList.length) {
      handleUpload();
    } else {
      close();
    }
  };

  const props: UploadProps = {
    multiple: true,
    maxCount: maxFiles,
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      const newFilesToUpload = filesToUpload.slice();
      newFileList.splice(index, 1);
      newFilesToUpload.splice(index, 1);
      setFileList(newFileList);
      setFilesToUpload(newFilesToUpload);
    },
    beforeUpload: (file) => {
      if (file.size > maxSize) {
        messageApi.open({
          type: "warning",
          content: t("File size limit {{0}}", {
            0: fileSize(maxSize),
          }),
        });
      } else {
        setFileList([...fileList, file]);
        setFilesToUpload([...filesToUpload, file]);
      }
      return false;
    },
    fileList,
  };

  const handleUpload = async () => {
    if (!selectedBoard) {
      return;
    }

    const total =
      fileList.reduce((acc, current) => acc + (current.size ?? 0), 0) +
      location.usage.storageUsed;

    if (total > location.usage.storageLimit) {
      return messageApi.open({
        type: "warning",
        content: t("You don't have enough storage to upload this file"),
      });
    }
    setUploading(true);
    for await (const file of filesToUpload) {
      const fileId = nanoid();
      const fileName = `${fileId}.${file.name.split(".").pop()}`;
      const fileRef = storageRef(
        STORAGE,
        `${baseStorageRef.fullPath}/${fileName}`
      );
      try {
        await uploadBytes(fileRef, file, {
          contentType: file.type,
          customMetadata: { fileId },
        });
        const newFileRecord = {
          id: fileId,
          name: file.name,
          createdAt: serverTimestamp(),
          createdBy: user.uid,
          fileType: file.type,
          size: file.size,
          storagePath: fileRef.fullPath,
        };
        await setDoc(
          doc(FIRESTORE, selectedBoard.contentRef.path, fileId),
          newFileRecord,
          {
            merge: true,
          }
        );
        messageApi.open({
          type: "success",
          content: t("Upload successfully"),
        });
      } catch (error) {
        recordError(error);
        messageApi.open({
          type: "error",
          content: t("Upload failed"),
        });
        continue;
      }
    }
    setFileList([]);
    setFilesToUpload([]);
    setUploading(false);
    close();
  };

  return (
    <Modal
      open={open}
      closable={false}
      title={t("Upload Files")}
      cancelText={t("Cancel")}
      okText={fileList.length ? t("Upload") : t("Accept")}
      onCancel={close}
      confirmLoading={uploading}
      okButtonProps={{ disabled: !fileList.length }}
      cancelButtonProps={{ disabled: uploading }}
      onOk={handleAccept}
    >
      {contextHolder}
      <Dragger {...props} disabled={uploading}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          {t("Drag & drop some files here, or click to select files")}
        </p>
        <p className="ant-upload-hint">
          {t("File size limit {{0}}", {
            0: fileSize(maxSize),
          })}
        </p>
      </Dragger>
    </Modal>
  );
};
