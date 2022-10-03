/* eslint-disable react-hooks/exhaustive-deps */
import {
  ref as storageRef,
  StorageReference,
  uploadBytes,
} from "@firebase/storage";
import React, { useState } from "react";
import fileSize from "filesize";
import { useTranslation } from "react-i18next";
import { message, Modal, Upload, UploadFile, UploadProps } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import {
  useCuttinboardModule,
  useLocation,
} from "@cuttinboard-solutions/cuttinboard-library/services";
import { nanoid } from "nanoid";
import {
  Auth,
  Firestore,
  Storage,
} from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { recordError } from "../../utils/utils";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

interface DropzoneDialogProps {
  maxFiles?: number;
  maxSize?: number;
  baseStorageRef: StorageReference;
  open: boolean;
  onClose: () => void;
}

const { Dragger } = Upload;

const PickFile: React.FC<DropzoneDialogProps> = ({
  maxFiles,
  maxSize,
  baseStorageRef,
  onClose,
  open,
}) => {
  const { t } = useTranslation();
  const { location } = useLocation();
  const { moduleContentRef } = useCuttinboardModule();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const close = () => {
    setFileList([]);
    onClose();
  };

  const handleAccept = () => {
    if (Boolean(fileList.length)) {
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
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      if (file.size > maxSize) {
        message.warning(
          t("File size limit {{0}}", {
            0: fileSize(maxSize),
          })
        );
      } else {
        setFileList([...fileList, file]);
      }

      return false;
    },
    fileList,
  };

  const handleUpload = async () => {
    const total =
      fileList.reduce((acc, current) => acc + current.size, 0) +
      location.usage.storageUsed;

    if (total > location.usage.storageLimit) {
      return message.warn(
        t("You don't have enough storage to upload this file")
      );
    }
    setUploading(true);
    for await (const file of fileList) {
      const fileId = nanoid();
      const fileName = `${fileId}.${file.name.split(".").pop()}`;
      const fileRef = storageRef(
        Storage,
        `${baseStorageRef.fullPath}/${fileName}`
      );
      try {
        await uploadBytes(fileRef, file.originFileObj, {
          contentType: file.type,
          customMetadata: { fileId },
        });
        const newFileRecord = {
          id: fileId,
          name: file.name,
          createdAt: serverTimestamp(),
          createdBy: Auth.currentUser?.uid,
          fileType: file.type,
          size: file.size,
          storagePath: fileRef.fullPath,
        };
        await setDoc(
          doc(Firestore, moduleContentRef.path, fileId),
          newFileRecord,
          {
            merge: true,
          }
        );
        message.success("upload successfully.");
      } catch (error) {
        recordError(error);
        message.error("upload failed.");
        continue;
      }
    }
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
      okButtonProps={{ disabled: !Boolean(fileList.length) }}
      cancelButtonProps={{ disabled: uploading }}
      onOk={handleAccept}
    >
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

export default PickFile;
