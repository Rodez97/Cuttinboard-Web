import {
  DeleteFilled,
  DownloadOutlined,
  ExclamationCircleOutlined,
  FileFilled,
  InboxOutlined,
} from "@ant-design/icons";
import { Storage } from "@cuttinboard/cuttinboard-library/firebase";
import { useCuttinboard } from "@cuttinboard/cuttinboard-library/services";
import { Colors } from "@cuttinboard/cuttinboard-library/utils";
import {
  Avatar,
  Card,
  Divider,
  Empty,
  List,
  message,
  Modal,
  Space,
  Typography,
  Upload,
  UploadProps,
} from "antd";
import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  StorageReference,
  uploadBytes,
} from "firebase/storage";
import React, { useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PageLoading from "../components/PageLoading";
import { recordError } from "../utils/utils";

const { Dragger } = Upload;

function MyDocuments() {
  const { t } = useTranslation();
  const { user } = useCuttinboard();
  const [userFiles, setUserFiles] = useState<StorageReference[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useLayoutEffect(() => {
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
    const storageRef = ref(Storage, `users/${user.uid}/documents/${file.name}`);
    try {
      const uploadRef = await uploadBytes(storageRef, file, {
        contentType: file.type,
      });
      setUserFiles([...userFiles, uploadRef.ref]);
    } catch (error) {
      recordError(error);
    }
  };

  const handleDeleteFile = (file: StorageReference) => async () => {
    Modal.confirm({
      title: t(
        "Are you sure you want to delete this file? This action cannot be undone."
      ),
      icon: <ExclamationCircleOutlined />,

      async onOk() {
        try {
          await deleteObject(file);
          setUserFiles(userFiles.filter((f) => f.fullPath !== file.fullPath));
        } catch (error) {
          recordError(error);
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
    const userStorageRef = ref(Storage, `users/${user.uid}/documents`);
    const userResult = await listAll(userStorageRef);
    setUserFiles(userResult.items);
    setLoadingFiles(false);
  };

  const props: UploadProps = {
    beforeUpload: async (file) => {
      message.loading(t("Uploading File"));
      await handleChange(file);
      message.destroy();
      return false;
    },
    fileList: [],
  };

  return (
    <Space
      direction="vertical"
      style={{
        display: "flex",
        padding: 20,
      }}
      align="center"
    >
      <Typography.Title>{t("My Documents")}</Typography.Title>
      <Typography.Title level={5} type="secondary">
        {t(
          "Employers will have access to the documents you upload in this section"
        )}
      </Typography.Title>
      <Space
        direction="vertical"
        style={{
          maxWidth: 500,
          minWidth: 300,
          width: "100%",
          marginBottom: 3,
        }}
      >
        <Dragger {...props}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">{t("Upload Document")}</p>
          <p className="ant-upload-hint">
            {t("Click or drag file to this area to upload")}
          </p>
        </Dragger>

        <Card>
          <Divider>{t("Documents")}</Divider>
          {loadingFiles ? (
            <PageLoading />
          ) : userFiles.length ? (
            <List>
              {userFiles.map((file, index) => (
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
              ))}
            </List>
          ) : (
            <Empty description={t("No documents")} />
          )}
        </Card>
      </Space>
    </Space>
  );
}

export default MyDocuments;
