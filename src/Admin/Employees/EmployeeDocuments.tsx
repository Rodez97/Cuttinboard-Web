/** @jsx jsx */
import { jsx } from "@emotion/react";
import { Storage } from "@cuttinboard/cuttinboard-library/firebase";
import { Employee } from "@cuttinboard/cuttinboard-library/models";
import {
  useCuttinboard,
  useLocation,
} from "@cuttinboard/cuttinboard-library/services";
import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  StorageReference,
  uploadBytes,
} from "firebase/storage";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Card,
  Divider,
  List,
  message,
  Modal,
  Space,
  Upload,
  UploadProps,
} from "antd";
import {
  DeleteFilled,
  DownloadOutlined,
  ExclamationCircleOutlined,
  FileFilled,
  InboxOutlined,
} from "@ant-design/icons";
import { Colors } from "@cuttinboard/cuttinboard-library/utils";
import { recordError } from "../../utils/utils";

const { Dragger } = Upload;

function EmployeeDocuments({ employee }: { employee: Employee }) {
  const { t } = useTranslation();
  const { locationId, location } = useLocation();
  const { user } = useCuttinboard();
  const [files, setFiles] = useState<StorageReference[]>([]);
  const [userFiles, setUserFiles] = useState<StorageReference[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadFilesFromStorage();
  }, []);

  const handleChange = async (file: File) => {
    const filenameParts = file.name.split(".");
    const fileExtension = filenameParts.pop();
    const filename = filenameParts.join(".");
    const fileName = prompt(
      "Enter file name (Optional, leave blank to use original name)",
      filename
    );
    const newFile = fileName
      ? new File([file], `${fileName}.${fileExtension}`, { type: file.type })
      : file;
    await handleSaveFile(newFile);
  };

  const handleSaveFile = async (file: File) => {
    const storageRef = ref(
      Storage,
      `organizations/${location.organizationId}/employees/${employee.id}/location/${locationId}/${file.name}`
    );
    try {
      const uploadRef = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          locationId,
          employeeId: employee.id,
          uploadedBy: user.uid,
        },
      });
      setFiles([...files, uploadRef.ref]);
    } catch (error) {
      recordError(error);
    }
  };

  const handleDeleteFile = (file: StorageReference) => () => {
    Modal.confirm({
      title: t("Are you sure you want to delete this file from the location?"),
      content: file.name,
      icon: <ExclamationCircleOutlined />,
      okText: t("Yes"),
      okType: "danger",
      cancelText: t("No"),
      async onOk() {
        try {
          await deleteObject(file);
          setFiles(files.filter((f) => f.fullPath !== file.fullPath));
        } catch (error) {
          return recordError(error);
        }
      },
      onCancel() {},
    });
  };

  const handleFileClick = (file: StorageReference) => async () => {
    const url = await getDownloadURL(file);
    window.open(url, "_blank");
  };

  const loadFilesFromStorage = async () => {
    setLoadingFiles(true);
    const storageRef = ref(
      Storage,
      `organizations/${location.organizationId}/employees/${employee.id}/location/${locationId}`
    );
    const result = await listAll(storageRef);
    setFiles(result.items);
    const userStorageRef = ref(Storage, `users/${employee.id}/documents`);
    const userResult = await listAll(userStorageRef);
    setUserFiles(userResult.items);
    setLoadingFiles(false);
  };

  const props: UploadProps = {
    beforeUpload: async (file) => {
      setUploading(true);
      message.loading(t("Uploading File"));
      await handleChange(file);
      setUploading(false);
      message.destroy();
      return false;
    },
    fileList: [],
  };
  return (
    <div
      css={{
        display: "flex",
        minWidth: 300,
        maxWidth: 500,
        margin: "auto",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <Card title={t("Employee Documents")}>
        <Dragger {...props}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">{t("Upload Document")}</p>
          <p className="ant-upload-hint">
            {t("Click or drag file to this area to upload")}
          </p>
        </Dragger>

        <Divider>{t("Documents")}</Divider>
        <List
          loading={loadingFiles}
          dataSource={files}
          bordered
          renderItem={(file, index) => (
            <List.Item
              key={index}
              actions={[
                <DeleteFilled
                  key="delete"
                  onClick={handleDeleteFile(file)}
                  style={{ color: Colors.Error.errorMain }}
                />,
                <DownloadOutlined
                  key="download"
                  onClick={handleFileClick(file)}
                />,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<FileFilled />} />}
                description={file.name}
              />
            </List.Item>
          )}
        />
      </Card>

      <Card title={t("Uploaded by employee")}>
        <List
          loading={loadingFiles}
          dataSource={userFiles}
          bordered
          renderItem={(file, index) => (
            <List.Item
              key={index}
              actions={[
                <DownloadOutlined
                  key="download"
                  onClick={handleFileClick(file)}
                />,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<FileFilled />} />}
                description={file.name}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}

export default EmployeeDocuments;
