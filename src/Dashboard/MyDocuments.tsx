/** @jsx jsx */
import { jsx } from "@emotion/react";
import {
  DeleteFilled,
  DownloadOutlined,
  ExclamationCircleOutlined,
  FileFilled,
  InboxOutlined,
} from "@ant-design/icons";
import { Storage } from "@cuttinboard-solutions/cuttinboard-library/firebase";
import { useCuttinboard } from "@cuttinboard-solutions/cuttinboard-library/services";
import {
  Alert,
  Avatar,
  Button,
  Divider,
  List,
  message,
  Modal,
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
import { useLayoutEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
    <div css={{ display: "flex", flexDirection: "column", padding: 20 }}>
      <div
        css={{
          minWidth: 270,
          maxWidth: 500,
          margin: "auto",
          width: "100%",
        }}
      >
        <Typography.Title css={{ textAlign: "center" }}>
          {t("My Documents")}
        </Typography.Title>

        <Alert
          type="warning"
          showIcon
          css={{ marginBottom: 10 }}
          message={
            <Typography.Title level={5} type="secondary">
              {t(
                "Employers will have access to the documents you upload in this section"
              )}
            </Typography.Title>
          }
        />

        <div>
          <Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">{t("Upload Document")}</p>
            <p className="ant-upload-hint">
              {t("Click or drag file to this area to upload")}
            </p>
          </Dragger>
        </div>

        <Divider>{t("Documents")}</Divider>

        <List loading={loadingFiles}>
          {userFiles.map((file, index) => (
            <List.Item
              key={index}
              actions={[
                <Button
                  key="delete"
                  icon={<DeleteFilled />}
                  onClick={handleDeleteFile(file)}
                  type="link"
                  danger
                />,
                <Button
                  key="download"
                  icon={<DownloadOutlined />}
                  onClick={handleFileClick(file)}
                  type="link"
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
      </div>
    </div>
  );
}

export default MyDocuments;
