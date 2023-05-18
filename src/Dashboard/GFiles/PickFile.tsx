import {
  UploadTask,
  ref as storageRef,
  uploadBytesResumable,
} from "firebase/storage";
import React, { useRef, useState } from "react";
import fileSize from "filesize";
import { useTranslation } from "react-i18next";
import { message, Modal, Upload, UploadFile, UploadProps } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { recordError } from "../../utils/utils";
import { doc, Timestamp } from "firebase/firestore";
import { StorageReference } from "firebase/storage";
import { nanoid } from "nanoid";
import { useDashboard } from "../DashboardProvider";
import {
  FIRESTORE,
  STORAGE,
  useFiles,
  useGBoard,
} from "@cuttinboard-solutions/cuttinboard-library";
import { ICuttinboard_File } from "@cuttinboard-solutions/types-helpers";

const { Dragger } = Upload;

type PickFileProps = {
  maxSize: number;
  baseStorageRef: StorageReference;
  onClose: () => void;
  open: boolean;
};

export default ({ maxSize, baseStorageRef, onClose, open }: PickFileProps) => {
  const { selectedBoard } = useGBoard();
  if (!selectedBoard) {
    throw new Error("No board selected");
  }
  const { t } = useTranslation();
  const { organization } = useDashboard();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const { addFile } = useFiles();
  const uploadTask = useRef<UploadTask | null>(null);
  const [uploading, setUploading] = useState(false);

  const close = () => {
    setFileList([]);
    setFilesToUpload([]);
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
    maxCount: 1,
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
      } else if (fileList.length > 0) {
        messageApi.open({
          type: "warning",
          content: t("You can only upload one file at a time"),
        });
      } else {
        setFileList([file]);
        setFilesToUpload([file]);
      }
      return false;
    },
    fileList,
    progress: {
      strokeColor: {
        "0%": "#108ee9",
        "100%": "#87d068",
      },
      format: (percent) => percent && `${parseFloat(percent.toFixed(2))}%`,
    },
  };

  const handleUpload = async () => {
    if (!selectedBoard) {
      return;
    }

    const organizationStorageUsed = Number(organization?.storageUsed ?? 0);

    const organizationStorageLimit = Number(organization?.limits?.storage ?? 0);

    const fileToUpload = filesToUpload[0];

    const total = fileToUpload.size ?? 0 + organizationStorageUsed;

    if (total > organizationStorageLimit) {
      return messageApi.open({
        type: "warning",
        content: t("You don't have enough storage to upload this file"),
      });
    }
    const fileId = nanoid();
    const fileName = `${fileId}.${fileToUpload.name.split(".").pop()}`;
    const fileRef = storageRef(
      STORAGE,
      `${baseStorageRef.fullPath}/${fileName}`
    );
    const documentRef = doc(
      FIRESTORE,
      selectedBoard.refPath,
      "content",
      fileId
    );

    setUploading(true);
    setFileList(([item]) => [{ ...item, status: "uploading" }]);

    uploadTask.current = uploadBytesResumable(fileRef, fileToUpload, {
      contentType: fileToUpload.type,
      customMetadata: { fileId },
    });

    // When the upload is complete, we add the file to the database
    uploadTask.current.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFileList(([item]) => [{ ...item, percent: progress }]);
      },
      (error) => {
        recordError(error);
        messageApi.open({
          type: "error",
          content: t("Upload failed"),
        });
        setUploading(false);
        setFileList([]);
        setFilesToUpload([]);
      },
      () => {
        const newFileRecord: ICuttinboard_File = {
          id: fileId,
          name: fileToUpload.name,
          createdAt: Timestamp.now().toMillis(),
          fileType: fileToUpload.type,
          size: fileToUpload.size,
          storagePath: fileRef.fullPath,
          refPath: documentRef.path,
        };
        addFile(newFileRecord);
        messageApi.open({
          type: "success",
          content: t("Upload successfully"),
        });
        setUploading(false);
        close();
        setFileList([]);
        setFilesToUpload([]);
      }
    );
  };

  const handleCancel = () => {
    if (uploadTask.current) {
      uploadTask.current.cancel();
      uploadTask.current = null;
    }
    close();
  };

  return (
    <Modal
      open={open}
      closable={false}
      title={t("Upload Files")}
      cancelText={t("Cancel")}
      okText={fileList.length ? t("Upload") : t("Accept")}
      onCancel={handleCancel}
      confirmLoading={uploading}
      okButtonProps={{ disabled: !fileList.length || uploading }}
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
